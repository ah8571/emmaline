# TTS Options

## Goal
Choose a voice provider that sounds natural for real-time phone conversations in Emmaline.

## Shortlist

### 1) ElevenLabs
- Best-in-class naturalness/prosody for conversational voices.
- Strong voice quality across accents and emotional tone.
- Good fit if voice quality is the top priority.
- Tradeoff: can be more expensive and requires careful latency tuning for live calls.

### 2) OpenAI TTS
- Very strong overall quality and consistency.
- Clean integration if OpenAI is already used for response generation.
- Good developer experience and straightforward API usage.
- Tradeoff: naturalness can be slightly behind top ElevenLabs voices for some use cases.

### 3) Cartesia
- Optimized for low-latency conversational output.
- Good balance of quality + speed for real-time interaction.
- Good option when responsiveness is a primary constraint.
- Tradeoff: voice catalog/style controls are narrower than larger providers.

### 4) PlayHT
- Good quality and broad voice library.
- Useful when you need many voice personas quickly.
- Tradeoff: quality can vary between voices/models.

### 5) Google Cloud Text-to-Speech
- Reliable enterprise platform with broad language coverage.
- Already present in this codebase.
- Good baseline quality and stable infra.
- Tradeoff: often less expressive than top specialized conversational providers.

### 6) Azure Neural TTS
- Strong enterprise option with broad region/language support.
- Good quality, SSML controls, and compliance tooling.
- Tradeoff: voice “human-ness” can still trail top premium options in some A/B tests.

## Recommended path for Emmaline
1. Start A/B testing with **ElevenLabs** and **OpenAI TTS**.
2. Keep **Google Cloud TTS** as a fallback because it is already scaffolded.
3. Evaluate with call-specific metrics:
   - perceived naturalness,
   - turn latency,
   - interruption handling,
   - cost per minute.

## Provider toggle now available in backend
Set these values in backend environment:

```env
TTS_PROVIDER=elevenlabs
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=JBFqnCBsd6RMkjVDRZzb
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
```

Alternative values:

```env
TTS_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_TTS_VOICE=alloy
```

```env
TTS_PROVIDER=google
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
```

## Current codebase status (important)
- Twilio media stream transport is wired (`/ws/media-stream`).
- OpenAI text-response service exists (`aiService.js`).
- Google STT service exists (`speechToTextService.js`) but is not fully connected to live stream processing.
- Multi-provider TTS service exists (`textToSpeechService.js`) with `google`, `openai`, and `elevenlabs`, but it is not yet wired into the active Twilio media loop.
- The real-time speech pipeline in `mediaStreamHandler.js` is still TODO in key sections.
