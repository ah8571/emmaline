/**
 * Text-to-Speech Service
 * Converts text responses to audio using configurable providers.
 * Supported providers: google, openai, elevenlabs
 */

import textToSpeech from '@google-cloud/text-to-speech';
import axios from 'axios';
import { OpenAI } from 'openai';

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const DEFAULT_PROVIDER = (process.env.TTS_PROVIDER || 'google').toLowerCase();
const OPENAI_TTS_MODEL = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
const OPENAI_TTS_VOICE = process.env.OPENAI_TTS_VOICE || 'alloy';
const ELEVENLABS_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';

// Initialize TTS client (uses Application Default Credentials)
let ttsClient = null;
let openaiClient = null;

try {
  ttsClient = new textToSpeech.TextToSpeechClient({
    projectId
  });
  console.log('✓ Google Cloud Text-to-Speech client initialized');
} catch (error) {
  console.error('Failed to initialize Text-to-Speech client:', error.message);
  console.error('Make sure GOOGLE_CLOUD_PROJECT_ID is set and gcloud auth is configured');
}

if (process.env.OPENAI_API_KEY) {
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

const resolveProvider = (options = {}) => {
  return (options.provider || DEFAULT_PROVIDER).toLowerCase();
};

const textToAudioGoogle = async (text, options = {}) => {
  if (!ttsClient) {
    throw new Error('Google Text-to-Speech client not initialized');
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

  const [response] = await ttsClient.synthesizeSpeech(request);
  return Buffer.from(response.audioContent);
};

const textToAudioOpenAI = async (text, options = {}) => {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized. Set OPENAI_API_KEY');
  }

  const model = options.model || OPENAI_TTS_MODEL;
  const voice = options.voice || OPENAI_TTS_VOICE;
  const responseFormat = options.responseFormat || 'wav';

  const response = await openaiClient.audio.speech.create({
    model,
    voice,
    input: text,
    response_format: responseFormat
  });

  const audioArrayBuffer = await response.arrayBuffer();
  return Buffer.from(audioArrayBuffer);
};

const textToAudioElevenLabs = async (text, options = {}) => {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('ElevenLabs API key missing. Set ELEVENLABS_API_KEY');
  }

  const voiceId = options.voiceId || ELEVENLABS_VOICE_ID;
  const modelId = options.modelId || ELEVENLABS_MODEL_ID;

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const response = await axios.post(
    url,
    {
      text,
      model_id: modelId,
      voice_settings: {
        stability: options.stability ?? 0.5,
        similarity_boost: options.similarityBoost ?? 0.75,
        style: options.style ?? 0.0,
        use_speaker_boost: options.useSpeakerBoost ?? true
      }
    },
    {
      headers: {
        'xi-api-key': apiKey,
        accept: 'audio/mpeg',
        'content-type': 'application/json'
      },
      responseType: 'arraybuffer'
    }
  );

  return Buffer.from(response.data);
};

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
    const provider = resolveProvider(options);
    console.log(`Converting to speech with ${provider}: "${text.substring(0, 50)}..."`);

    let audioBuffer;

    if (provider === 'google') {
      audioBuffer = await textToAudioGoogle(text, options);
    } else if (provider === 'openai') {
      audioBuffer = await textToAudioOpenAI(text, options);
    } else if (provider === 'elevenlabs') {
      audioBuffer = await textToAudioElevenLabs(text, options);
    } else {
      throw new Error(`Unsupported TTS provider: ${provider}`);
    }

    console.log(`✓ Generated audio (${audioBuffer.length} bytes)`);
    return audioBuffer;
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
    if (DEFAULT_PROVIDER === 'google') {
      if (!ttsClient) {
        throw new Error('Google Text-to-Speech client not initialized');
      }

      const request = { languageCode };
      const [response] = await ttsClient.listVoices(request);

      return response.voices.map(voice => ({
        provider: 'google',
        name: voice.name,
        ssmlGender: voice.ssmlGender,
        naturalSampleRateHertz: voice.naturalSampleRateHertz,
        languageCodes: voice.languageCodes
      }));
    }

    if (DEFAULT_PROVIDER === 'openai') {
      return [
        { provider: 'openai', name: 'alloy' },
        { provider: 'openai', name: 'ash' },
        { provider: 'openai', name: 'ballad' },
        { provider: 'openai', name: 'coral' },
        { provider: 'openai', name: 'echo' },
        { provider: 'openai', name: 'sage' },
        { provider: 'openai', name: 'shimmer' },
        { provider: 'openai', name: 'verse' }
      ];
    }

    if (DEFAULT_PROVIDER === 'elevenlabs') {
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) {
        throw new Error('ElevenLabs API key missing. Set ELEVENLABS_API_KEY');
      }

      const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': apiKey
        }
      });

      return (response.data.voices || []).map(voice => ({
        provider: 'elevenlabs',
        name: voice.name,
        voiceId: voice.voice_id,
        category: voice.category,
        labels: voice.labels || {}
      }));
    }

    throw new Error(`Unsupported TTS provider: ${DEFAULT_PROVIDER}`);
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
  resolveProvider,
  textToAudio,
  getAvailableVoices,
  streamTextToAudio
};
