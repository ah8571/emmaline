/**
 * Google Cloud Speech-to-Text Service
 * Handles real-time transcription of audio streams
 */

import speech from '@google-cloud/speech';

// Initialize client
const speechClient = new speech.SpeechClient();

/**
 * Streaming recognition request configuration
 */
const getStreamingRecognizeConfig = () => ({
  config: {
    encoding: 'MULAW',
    sampleRateHertz: 8000,
    languageCode: 'en-US',
    enableAutomaticPunctuation: true,
    model: 'default',
    useEnhanced: true,
    profanityFilter: false,
    speechContexts: [
      {
        phrases: [
          'reminder', 'note', 'todo', 'schedule', 'call', 'email',
          'meeting', 'project', 'task', 'follow up', 'action item'
        ],
        boost: 20.0
      }
    ]
  },
  interimResults: true,
  singleUtterance: false
});

/**
 * Create streaming recognize request
 */
export const createStreamingRecognizeRequest = () => {
  return {
    streamingConfig: getStreamingRecognizeConfig(),
    audioContent: null
  };
};

/**
 * Process streaming audio chunk
 * Returns formatted request with audio content
 */
export const processAudioChunk = (audioPayload) => {
  return {
    audioContent: audioPayload
  };
};

/**
 * Parse streaming recognition response
 * Extracts transcript results
 */
export const parseStreamingResponse = (response) => {
  const results = response.results || [];

  const processedResults = results.map((result, index) => {
    const alternatives = result.alternatives || [];

    return {
      isFinal: result.isFinal,
      resultIndex: index,
      alternatives: alternatives.map((alt, altIndex) => ({
        transcript: alt.transcript || '',
        confidence: alt.confidence || 0,
        isAlternative: altIndex > 0
      })),
      // Primary transcript (most confident)
      transcript: alternatives.length > 0 ? alternatives[0].transcript : '',
      confidence: alternatives.length > 0 ? alternatives[0].confidence : 0
    };
  });

  return {
    results: processedResults,
    isFinal: results.length > 0 && results[results.length - 1].isFinal
  };
};

/**
 * Create streaming recognizer
 * Returns bidirectional stream for audio and results
 */
export const createStreamingRecognizer = async () => {
  try {
    // Create request stream
    const request = createStreamingRecognizeRequest();

    console.log('Creating streaming speech recognizer...');

    return {
      request,
      isActive: true,
      createdAt: Date.now()
    };
  } catch (error) {
    console.error('Error creating streaming recognizer:', error);
    throw error;
  }
};

/**
 * Send audio chunk for transcription
 * Should be called for each audio packet from Twilio
 */
export const transcribeAudioChunk = async (audioPayload) => {
  try {
    const request = processAudioChunk(audioPayload);
    return request;
  } catch (error) {
    console.error('Error processing audio chunk:', error);
    throw error;
  }
};

/**
 * Process full-transcript from Google Cloud response
 * Combines interim and final results into readable format
 */
export const processTranscriptResponse = (googleResponse) => {
  try {
    const parsed = parseStreamingResponse(googleResponse);

    // Return formatted transcript line
    return {
      isFinal: parsed.isFinal,
      text: parsed.results
        .filter(r => !r.alternatives[0]?.isAlternative)
        .map(r => r.transcript)
        .join(' '),
      confidence: parsed.results.length > 0 ? parsed.results[0].confidence : 0,
      alternatives: parsed.results
        .filter(r => r.alternatives.length > 1)
        .map(r => r.alternatives[1]?.transcript)
        .filter(Boolean)
    };
  } catch (error) {
    console.error('Error processing transcript response:', error);
    throw error;
  }
};

/**
 * Validate speech configuration
 * Checks that Google Cloud credentials are available
 */
export const validateSpeechConfig = () => {
  try {
    // Check if credentials are set
    const hasCredentials =
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      process.env.GOOGLE_CLOUD_CREDENTIALS;

    if (!hasCredentials) {
      console.warn('Warning: Google Cloud credentials not configured');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating speech config:', error);
    return false;
  }
};

export default {
  createStreamingRecognizer,
  transcribeAudioChunk,
  processTranscriptResponse,
  parseStreamingResponse,
  processAudioChunk,
  createStreamingRecognizeRequest,
  validateSpeechConfig,
  speechClient
};
