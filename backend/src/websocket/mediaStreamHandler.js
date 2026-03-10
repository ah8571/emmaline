/**
 * WebSocket Media Stream Handler
 * Handles Twilio media stream connections
 * Processes audio in real-time and sends transcripts back
 */

import { mediaStreamManager } from '../services/mediaStreamManager.js';
import {
  createStreamingRecognizer,
  processTranscriptResponse,
  validateSpeechConfig
} from '../services/speechToTextService.js';
import { saveCall, saveSummary, saveTranscript } from '../services/databaseService.js';
import { generateResponse, summarizeTranscript } from '../services/aiService.js';
import { textToAudio } from '../services/textToSpeechService.js';

const TWILIO_FRAME_SIZE = 160;
const INITIAL_GREETING = 'Hi, this is Emmaline. Tell me what you want to think through, and I will help turn it into notes.';

const parseUserIdFromIdentity = (identity) => {
  const value = String(identity || '').trim();
  return value.startsWith('user_') ? value.slice(5) : null;
};

const extractAudioPayload = (audioBuffer) => {
  if (!audioBuffer || audioBuffer.length < 12) {
    return audioBuffer;
  }

  const hasRiffHeader = audioBuffer.subarray(0, 4).toString('ascii') === 'RIFF';
  if (!hasRiffHeader) {
    return audioBuffer;
  }

  let offset = 12;
  while (offset + 8 <= audioBuffer.length) {
    const chunkId = audioBuffer.subarray(offset, offset + 4).toString('ascii');
    const chunkSize = audioBuffer.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;
    const chunkEnd = chunkStart + chunkSize;

    if (chunkId === 'data' && chunkEnd <= audioBuffer.length) {
      return audioBuffer.subarray(chunkStart, chunkEnd);
    }

    offset = chunkEnd + (chunkSize % 2);
  }

  return audioBuffer;
};

const streamAudioResponse = async (ws, streamSid, audioBuffer) => {
  const payload = extractAudioPayload(audioBuffer);

  for (let index = 0; index < payload.length; index += TWILIO_FRAME_SIZE) {
    const chunk = payload.subarray(index, index + TWILIO_FRAME_SIZE);
    if (chunk.length > 0) {
      sendAudioResponse(ws, streamSid, chunk);
    }
  }
};

const synthesizeAssistantReply = async (text) => {
  return textToAudio(text, {
    provider: 'google',
    voice: process.env.GOOGLE_TTS_VOICE || 'en-US-Neural2-C',
    audioEncoding: 'MULAW',
    sampleRateHertz: 8000
  });
};

const maybeCreateRecognizer = async (mediaConnection, ws) => {
  if (!validateSpeechConfig()) {
    mediaConnection.sttDisabled = true;
    return null;
  }

  const recognizer = await createStreamingRecognizer();
  const stream = recognizer.stream;

  stream.on('data', async (response) => {
    try {
      const transcript = processTranscriptResponse(response);
      const text = transcript.text?.trim();

      if (!text) {
        return;
      }

      if (!transcript.isFinal) {
        return;
      }

      if (mediaConnection.lastFinalTranscript === text) {
        return;
      }

      mediaConnection.lastFinalTranscript = text;
      mediaConnection.addTranscriptLine(text, true);

      if (mediaConnection.isResponding) {
        return;
      }

      mediaConnection.isResponding = true;
      mediaConnection.conversationHistory.push({ role: 'user', content: text });

      try {
        const assistantReply = await generateResponse(mediaConnection.conversationHistory);
        if (!assistantReply) {
          return;
        }

        mediaConnection.conversationHistory.push({ role: 'assistant', content: assistantReply });
        const audio = await synthesizeAssistantReply(assistantReply);
        await streamAudioResponse(ws, mediaConnection.streamSid, audio);
      } finally {
        mediaConnection.isResponding = false;
      }
    } catch (error) {
      mediaConnection.isResponding = false;
      console.error('Error processing streaming transcript:', error);
    }
  });

  stream.on('error', (error) => {
    console.error('Streaming speech recognizer error:', error);
  });

  mediaConnection.recognizer = recognizer;
  return recognizer;
};

const finalizeCallArtifacts = async (mediaConnection, stats) => {
  if (!mediaConnection.userId || mediaConnection.transcriptBuffer.length === 0) {
    return;
  }

  const fullTranscript = mediaConnection.transcriptBuffer
    .filter((line) => line.isFinal)
    .map((line) => line.text)
    .join('\n')
    .trim();

  if (!fullTranscript) {
    return;
  }

  const callRecord = await saveCall(mediaConnection.userId, {
    phoneNumber: mediaConnection.identity || `client:${mediaConnection.userId}`,
    duration: Math.round(stats.duration / 1000),
    startedAt: mediaConnection.createdAt.toISOString(),
    endedAt: new Date().toISOString(),
    status: 'completed',
    twilioCallSid: mediaConnection.callSid
  });

  await saveTranscript(callRecord.id, mediaConnection.userId, fullTranscript);

  try {
    const summary = await summarizeTranscript(fullTranscript);
    await saveSummary(callRecord.id, mediaConnection.userId, {
      text: summary.summary || '',
      keyPoints: summary.keyPoints || [],
      actionItems: summary.actionItems || [],
      sentiment: summary.sentiment || 'neutral'
    });
  } catch (error) {
    console.error('Error generating or saving call summary:', error);
  }
};

/**
 * Handle incoming WebSocket connection for media streaming
 */
export const handleMediaStreamWebSocket = (ws, req) => {
  let mediaConnection = null;
  let callSid = null;
  let userId = null;

  console.log('📞 New WebSocket connection for media stream');

  /**
   * Handle WebSocket messages from Twilio
   */
  ws.on('message', async (data) => {
    try {
      // Parse incoming message
      const message = JSON.parse(data.toString());

      // Handle different event types
      switch (message.event) {
        case 'connected':
          handleConnected(message, ws);
          break;

        case 'start':
          callSid = message.start?.callSid;
          userId = message.start?.customParameters?.userId || parseUserIdFromIdentity(message.start?.customParameters?.identity);
          mediaConnection = mediaStreamManager.createConnection(callSid, userId);
          handleStart(message, mediaConnection, ws);
          break;

        case 'media':
          if (mediaConnection) {
            await handleMedia(message, mediaConnection, ws);
          }
          break;

        case 'stop':
          if (mediaConnection) {
            await handleStop(message, mediaConnection, ws);
            mediaStreamManager.closeConnection(callSid);
            mediaConnection = null;
          }
          break;

        case 'mark':
          // Mark events are for tracking - just acknowledge
          break;

        default:
          console.warn('Unknown event type:', message.event);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  });

  /**
   * Handle WebSocket close
   */
  ws.on('close', () => {
    console.log('📞 WebSocket connection closed');

    if (mediaConnection) {
      mediaConnection.close();
      if (callSid) {
        mediaStreamManager.closeConnection(callSid);
      }
    }
  });

  /**
   * Handle WebSocket errors
   */
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);

    if (mediaConnection) {
      mediaConnection.close();
      if (callSid) {
        mediaStreamManager.closeConnection(callSid);
      }
    }
  });
};

/**
 * Handle 'connected' event
 * Confirms WebSocket connection establishment
 */
function handleConnected(message, ws) {
  console.log('✓ WebSocket connected to Twilio');
}

/**
 * Handle 'start' event
 * Marks beginning of media stream for a call
 */
function handleStart(message, mediaConnection, ws) {
  const { streamSid, callSid, customParameters } = message.start;
  const identity = customParameters?.identity || null;

  mediaConnection.activate();
  mediaConnection.streamSid = streamSid;
  mediaConnection.identity = identity;
  mediaConnection.userId = mediaConnection.userId || parseUserIdFromIdentity(identity);
  mediaConnection.conversationHistory = [];
  mediaConnection.lastFinalTranscript = null;
  mediaConnection.isResponding = false;

  console.log(`🎤 Media stream started:`);
  console.log(`   Call SID: ${callSid}`);
  console.log(`   Stream SID: ${streamSid}`);

  maybeCreateRecognizer(mediaConnection, ws).catch((error) => {
    console.error('Unable to create streaming recognizer:', error);
  });

  synthesizeAssistantReply(INITIAL_GREETING)
    .then((audio) => streamAudioResponse(ws, streamSid, audio))
    .catch((error) => {
      console.error('Error sending initial greeting audio:', error);
    });

}

/**
 * Handle 'media' event
 * Processes audio chunks from Twilio
 */
async function handleMedia(message, mediaConnection, ws) {
  try {
    const { payload, streamSid, sequenceNumber } = message.media;

    // Audio payload is base64 encoded
    const audioBuffer = Buffer.from(payload, 'base64');

    // Add to connection buffer
    mediaConnection.addAudioChunk(audioBuffer);

    if (mediaConnection.recognizer?.stream?.writable) {
      mediaConnection.recognizer.stream.write(audioBuffer);
    }

    // For now, log chunk received
    if (sequenceNumber && sequenceNumber % 100 === 0) {
      const stats = mediaConnection.getStats();
      console.log(`📊 Audio chunks processed: ${stats.audioChunksReceived}`);
    }
  } catch (error) {
    console.error('Error handling media chunk:', error);
  }
}

/**
 * Handle 'stop' event
 * Marks end of media stream for a call
 */
async function handleStop(message, mediaConnection, ws) {
  try {
    const { accountSid, callSid, streamSid } = message.stop;

    const stats = mediaConnection.getStats();

    console.log(`🛑 Media stream stopped:`);
    console.log(`   Call SID: ${callSid}`);
    console.log(`   Duration: ${Math.round(stats.duration / 1000)}s`);
    console.log(`   Audio chunks: ${stats.audioChunksReceived}`);
    console.log(`   Bytes received: ${stats.bytesReceived}`);

    if (mediaConnection.recognizer?.stream) {
      mediaConnection.recognizer.stream.end();
    }

    await finalizeCallArtifacts(mediaConnection, stats);

    mediaConnection.close();

  } catch (error) {
    console.error('Error handling media stop:', error);
  }
}

/**
 * Send message back through media stream
 * Used for sending audio responses or acknowledgments
 */
function sendMediaMessage(ws, message) {
  try {
    if (ws.readyState === ws.OPEN) {
      // Twilio Media Streams expects uncompressed WebSocket frames.
      ws.send(JSON.stringify(message), { compress: false });
    }
  } catch (error) {
    console.error('Error sending media message:', error);
  }
}

/**
 * Send audio chunk back to Twilio (for TTS responses)
 */
export function sendAudioResponse(ws, streamSid, audioPayload) {
  try {
    const message = {
      event: 'media',
      streamSid,
      media: {
        payload: audioPayload.toString('base64')
      }
    };

    sendMediaMessage(ws, message);
  } catch (error) {
    console.error('Error sending audio response:', error);
  }
}

/**
 * Send transcript update to client
 * For real-time transcript display in mobile app
 */
export function sendTranscriptUpdate(ws, streamSid, transcript, isFinal = false) {
  try {
    const message = {
      event: 'transcript',
      streamSid,
      transcript: {
        text: transcript,
        isFinal,
        timestamp: Date.now()
      }
    };

    sendMediaMessage(ws, message);
  } catch (error) {
    console.error('Error sending transcript update:', error);
  }
}

export default {
  handleMediaStreamWebSocket,
  sendAudioResponse,
  sendTranscriptUpdate
};
