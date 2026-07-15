import crypto from 'crypto';

const OPENAI_REALTIME_ENDPOINT = 'https://api.openai.com/v1/realtime/client_secrets';
const OPENAI_REALTIME_CALLS_ENDPOINT = 'https://api.openai.com/v1/realtime/calls';
const OPENAI_REALTIME_MODEL = process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-2.1';
const OPENAI_REALTIME_VOICE = process.env.OPENAI_REALTIME_VOICE || 'marin';
const OPENAI_REALTIME_TRANSCRIPTION_MODEL = process.env.OPENAI_REALTIME_TRANSCRIPTION_MODEL || 'gpt-realtime-whisper';
const getOpenAIRealtimeApiKey = () => {
  const apiKey = String(process.env.OPENAI_API_KEY || '').trim();

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured for voice mode.');
  }

  return apiKey;
};

const createSafetyIdentifier = (userId) => {
  return crypto
    .createHash('sha256')
    .update(`voice-mode:${userId}`)
    .digest('hex');
};

const buildRealtimeSessionConfig = ({ voice = OPENAI_REALTIME_VOICE } = {}) => ({
  type: 'realtime',
  model: OPENAI_REALTIME_MODEL,
  audio: {
    input: {
      noise_reduction: {
        type: 'near_field'
      },
      transcription: {
        model: OPENAI_REALTIME_TRANSCRIPTION_MODEL
      },
      turn_detection: {
        type: 'server_vad',
        silence_duration_ms: 700,
        prefix_padding_ms: 300,
        idle_timeout_ms: 5000
      }
    },
    output: {
      voice
    }
  }
});

export const createOpenAIRealtimeClientSecret = async ({ userId, voice = OPENAI_REALTIME_VOICE } = {}) => {
  const apiKey = getOpenAIRealtimeApiKey();
  const response = await fetch(OPENAI_REALTIME_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Safety-Identifier': createSafetyIdentifier(userId)
    },
    body: JSON.stringify({
      session: buildRealtimeSessionConfig({ voice })
    })
  });

  if (!response.ok) {
    const detailText = await response.text();
    throw new Error(`OpenAI realtime session request failed (${response.status}): ${detailText}`);
  }

  const data = await response.json();
  const clientSecret = data?.value || data?.client_secret?.value || null;

  if (!clientSecret) {
    throw new Error('OpenAI realtime session response did not include a client secret.');
  }

  return {
    provider: 'openai-realtime',
    transport: 'webrtc-unified-backend',
    clientSecret,
    expiresAt: data?.expires_at || data?.client_secret?.expires_at || null,
    model: data?.session?.model || OPENAI_REALTIME_MODEL,
    voice: data?.session?.audio?.output?.voice || voice,
    sessionId: data?.session?.id || null
  };
};

export const createOpenAIRealtimeCallAnswer = async ({ userId, offerSdp, voice = OPENAI_REALTIME_VOICE } = {}) => {
  const apiKey = getOpenAIRealtimeApiKey();
  const formData = new FormData();

  formData.set('sdp', String(offerSdp || ''));
  formData.set('session', JSON.stringify(buildRealtimeSessionConfig({ voice })));

  const response = await fetch(OPENAI_REALTIME_CALLS_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'OpenAI-Safety-Identifier': createSafetyIdentifier(userId)
    },
    body: formData
  });

  if (!response.ok) {
    const detailText = await response.text();
    throw new Error(`OpenAI realtime call setup failed (${response.status}): ${detailText}`);
  }

  return response.text();
};