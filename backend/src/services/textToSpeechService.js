/**
 * Text-to-Speech Service
 * Converts text responses to audio using Google Cloud TTS
 * Uses Application Default Credentials for authentication
 */

import textToSpeech from '@google-cloud/text-to-speech';

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

// Initialize TTS client (uses Application Default Credentials)
let ttsClient = null;

try {
  ttsClient = new textToSpeech.TextToSpeechClient({
    projectId
  });
  console.log('✓ Google Cloud Text-to-Speech client initialized');
} catch (error) {
  console.error('Failed to initialize Text-to-Speech client:', error.message);
  console.error('Make sure GOOGLE_CLOUD_PROJECT_ID is set and gcloud auth is configured');
}

/**
 * Convert text to speech audio
 * @param {string} text - The text to convert to speech
 * @param {Object} options - Configuration options
 * @param {string} options.languageCode - Language code (default: 'en-US')
 * @param {string} options.voice - Voice name (default: 'en-US-Neural2-C')
 * @param {string} options.audioEncoding - Audio format (default: 'LINEAR16')
 * @returns {Promise<Buffer>} Audio data as buffer
 */
export const textToAudio = async (
  text,
  options = {}
) => {
  try {
    if (!ttsClient) {
      throw new Error('Text-to-Speech client not initialized');
    }

    const {
      languageCode = 'en-US',
      voice = 'en-US-Neural2-C',
      audioEncoding = 'LINEAR16'
    } = options;

    const request = {
      input: { text },
      voice: {
        languageCode,
        name: voice
      },
      audioConfig: {
        audioEncoding
      }
    };

    console.log(`Converting to speech: "${text.substring(0, 50)}..."`);

    const [response] = await ttsClient.synthesizeSpeech(request);

    // response.audioContent is a Buffer
    console.log(`✓ Generated audio (${response.audioContent.length} bytes)`);

    return response.audioContent;
  } catch (error) {
    console.error('Error converting text to speech:', error);
    throw error;
  }
};

/**
 * Get available voices for a language
 * @param {string} languageCode - Language code (default: 'en-US')
 * @returns {Promise<Array>} List of available voices
 */
export const getAvailableVoices = async (languageCode = 'en-US') => {
  try {
    if (!ttsClient) {
      throw new Error('Text-to-Speech client not initialized');
    }

    const request = { languageCode };
    const [response] = await ttsClient.listVoices(request);

    const voices = response.voices.map(voice => ({
      name: voice.name,
      ssmlGender: voice.ssmlGender,
      naturalSampleRateHertz: voice.naturalSampleRateHertz,
      languageCodes: voice.languageCodes
    }));

    return voices;
  } catch (error) {
    console.error('Error getting available voices:', error);
    throw error;
  }
};

/**
 * Stream text to speech audio
 * Yields audio chunks as they're generated
 * @param {string} text - The text to convert
 * @param {Object} options - Configuration options
 * @yields {Buffer} Audio chunks
 */
export const streamTextToAudio = async function* (
  text,
  options = {}
) {
  try {
    const audioBuffer = await textToAudio(text, options);
    yield audioBuffer;
  } catch (error) {
    console.error('Error streaming audio:', error);
    throw error;
  }
};

export default {
  textToAudio,
  getAvailableVoices,
  streamTextToAudio
};
