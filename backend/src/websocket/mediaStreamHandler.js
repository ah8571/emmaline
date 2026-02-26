/**
 * WebSocket Media Stream Handler
 * Handles Twilio media stream connections
 * Processes audio in real-time and sends transcripts back
 */

import { mediaStreamManager } from '../services/mediaStreamManager.js';
import { processAudioChunk, processTranscriptResponse } from '../services/speechToTextService.js';
import { saveCall, saveTranscript } from '../services/databaseService.js';

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
          userId = message.start?.customParameters?.userId;
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

  mediaConnection.activate();

  console.log(`🎤 Media stream started:`);
  console.log(`   Call SID: ${callSid}`);
  console.log(`   Stream SID: ${streamSid}`);

  // Store stream SID for later reference
  mediaConnection.streamSid = streamSid;

  // Send ready message back to Twilio
  sendMediaMessage(ws, {
    event: 'ready',
    streamSid
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

    // TODO: Send to Google Cloud Speech-to-Text
    // This would involve:
    // 1. Accumulating audio chunks
    // 2. Sending to streaming speech-to-text
    // 3. Receiving interim and final transcripts
    // 4. Sending results back via WebSocket

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

    // TODO: Process final transcript and save to database
    // Steps:
    // 1. Finalize any pending audio
    // 2. Save complete transcript to database
    // 3. Generate summary with AI
    // 4. Store summary in database

    mediaConnection.close();

    // Send acknowledgment
    sendMediaMessage(ws, {
      event: 'stopped',
      streamSid
    });
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
      ws.send(JSON.stringify(message));
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
