# TTS Options

## Goal
Choose a voice provider that sounds natural for Emmaline, especially for Reader playback and future voice-mode UX.

## Status
This file is now a short entry point. The broader comparison work lives in [API PROVIDER RESEARCH.md](API%20PROVIDER%20RESEARCH.md).

## Current Recommendation

### Reader voice
- First test: ElevenLabs
- Secondary comparison: OpenAI
- Additional comparison: Google

Reasoning:
- Reader quality is mostly about natural narration, not full conversational orchestration.
- ElevenLabs is currently the strongest narration-focused candidate in our research set.

### In-app voice mode
- First test: OpenAI direct
- Secondary comparison: Google direct
- Future benchmark vendors: Retell and Vapi

Reasoning:
- We prefer direct-provider integrations where possible for cost control.
- Packaged voice-agent vendors may still be useful benchmarks later.

## Multilingual Notes

For mixed English and Spanish usage, the research focus should stay on:

- multilingual TTS that preserves a natural voice across language switching
- STT that handles code-switching in one session
- latency that still feels conversational on mobile networks

Current research candidates are tracked in [API PROVIDER RESEARCH.md](API%20PROVIDER%20RESEARCH.md).


