# Emmaline: AI Phone Call Buddy Concept

## Overview

Emmaline is a hands-free, voice-first AI assistant accessible via phone call. Users can call a dedicated phone number and speak with an AI assistant in real-time while multitasking—cooking, commuting, shopping, or any daily activity. Conversations are automatically transcribed, summarized, and organized in a minimalistic note-taking interface for later review and reference.

### The Value Proposition
- **Hands-free interaction**: No need to text or type—just call and talk
- **True multitasking**: Engage with AI while fully focused on other tasks
- **Persistent knowledge**: Transcripts and summaries are stored and retrievable
- **Minimal friction**: Simple, clean interface for organizing thoughts

---

## Roadmap & Development Phases

### Table of Contents
1. [Phase 1: MVP with Cloud Infrastructure](#phase-1-mvp-with-cloud-infrastructure)
2. [Phase 2: OpenClaw Integration + Enhanced Privacy](#phase-2-openclaw-integration--enhanced-privacy)
3. [Phase 3: Completely Local & Private](#phase-3-completely-local--private)

---

## Phase 1: MVP with Cloud Infrastructure

### Development Features

1. **Phone-based AI interface** – Call a phone number to speak with the AI
2. **Live conversation** – Real-time speech-to-text and AI responses
3. **Automatic transcription** – Full transcript of each call captured
4. **Intelligent summarization** – Key points extracted and bulleted
5. **Note-taking timeline** – View and organize call summaries in a mobile app
6. **User authentication** – Basic user accounts and data isolation

### User Flow

```
User calls phone number
        ↓
Twilio Voice (routing)
        ↓
Backend (Node.js)
        ↓
Speech-to-text conversion
        ↓
AI response generation
        ↓
Text-to-speech back to user
        ↓
Save transcript to database
```

### Data Flow

```
AI Phone Number (Twilio)
        ↓
Live conversation
        ↓
Transcript generated
        ↓
Saved to database (Supabase)
        ↓
Shown inside mobile app timeline
        ↓
AI extracts key ideas → notes page
```

### Privacy Model: Tier 1 - Cloud with Standard Security

**What data goes where:**
- User audio is streamed to Google Cloud Speech-to-Text for transcription
- Transcripts are sent to OpenAI for summarization
- Full transcripts and summaries stored in Supabase (encrypted at rest)
- Only authenticated users can access their own conversation data

**Security measures:**
- User authentication required (username/password or OAuth)
- Encrypted database storage (Supabase default AES-256)
- HTTPS for all API communication
- Environment variables for sensitive keys (never committed to git)

**User expectations:**
- Transparent privacy policy explaining data flow
- Clear disclosure that OpenAI/Google Cloud can technically access conversation data
- Ability to delete conversations permanently
- Data retention policies documented (e.g., auto-delete after 90 days if desired)

**Limitations:**
- External APIs can see conversation content during processing
- Not suitable for extremely sensitive conversations
- Standard API rate limiting applies

### Scaling & Monitoring Considerations

**Key metrics to monitor as user base grows:**
- **Backend server CPU/memory** – Monitor for capacity limits (~10-100 concurrent calls per server)
- **Google Cloud STT concurrent connections** – Track API quota usage (requires paid tier above certain volume)
- **OpenAI API token usage** – Monitor spend and rate limiting (tokens/minute limits)
- **Database connection pool limits** – Supabase connections scale with user load (upgrade plan as needed)

**Scaling approach:**
- Single Twilio phone number cost remains constant (~$1-2/month)
- Bottleneck shifts from phone infrastructure to backend services
- Auto-scaling backend (via Docker/Kubernetes) more cost-effective than adding phone numbers
- Monitor these four metrics to understand when to scale each component

### Compliance & Legal Requirements

**GDPR Compliance (mandatory for any EU users):**
- [ ] Create and publish Privacy Policy (see GDPR_COMPLIANCE.md)
- [ ] Add consent screen before first login (users must accept data processing)
- [ ] Implement user rights endpoints (download data, delete account)
- [ ] Sign Data Processing Agreements (DPA) with Supabase, Google Cloud, OpenAI
- [ ] Set up breach notification procedures (72-hour notification requirement)
- [ ] Document data retention policies (auto-delete after 90 days for backups)

**User Rights to Implement:**
1. **Right to Access** – Users can download all their data (Settings → "Download My Data")
2. **Right to Deletion** – Users can delete individual calls or entire account
3. **Right to Portability** – Users can export data in standard format
4. **Right to Correction** – Users can edit their profile and notes
5. **Right to Withdraw Consent** – Users can delete account anytime

**Key Implementation Tasks:**
- Add consent checkbox screen (appears before LoginScreen on first launch)
- Create Settings screen with: Download My Data, Delete Account, Privacy Policy link
- Implement backend API endpoints: GET /api/user/data, DELETE /api/user
- Add Privacy Policy page in app (link from Settings and consent screen)
- Document third-party data sharing transparently

**Documentation:**
- See [GDPR_COMPLIANCE.md](GDPR_COMPLIANCE.md) for complete implementation guide with code examples and Privacy Policy template

---

## Phase 2: OpenClaw Integration + Enhanced Privacy

### Development Features

**Core additions:**
- **Text chat interface** – Message the AI bot in addition to calling
- Email sorting and summarization via voice
- Code project initiation on the go
- Developer-focused virtual assistant features
- Expanded multitasking for busy developers
- OpenClaw ecosystem integration
- Advanced conversation history and context retention
- Topic-based conversation organization

**Improvements:**
- Better summarization (action items, sentiment, context)
- Conversation search and filtering
- Integration with developer tools (GitHub, email, project management)
- Chat interface for text-based conversations (same AI, same notes)
  - Send/receive messages from mobile app
  - Real-time chat with AI buddy
  - Auto-generate notes and summaries from chat
  - Similar timeline view as voice calls
  - Useful for quiet environments or when speaking isn't available

### Privacy Model: Tier 2 - Enhanced Privacy with Local Options

**What's different from Phase 1:**
- Option for users to run summarization locally (on backend) instead of sending to OpenAI
- Automatic transcript deletion after configurable period (default 30 days)
- End-to-end encryption option for stored transcripts
- User consent dashboard showing all data flows
- GDPR and privacy law compliance features

**Security measures (additional):**
- Local LLM option for summarization (smaller models on backend)
- Database-level encryption options (beyond default)
- Audit logs of who accessed what data
- Data export functionality for user portability
- Configurable data retention policies per conversation

**User expectations:**
- Users can choose between cloud and local processing
- Opt-in/opt-out for each external service
- Privacy dashboard showing data usage
- Ability to download their full data in standard format

**Advantages over Phase 1:**
- More user control over data routing
- Faster processing (local summarization)
- Better privacy for sensitive conversations
- Compliance-ready for regulated industries

---

## Phase 3: Completely Local & Private

### Development Features

- Full on-device AI conversation (no external API calls)
- Local speech-to-text (using open-source models like Whisper)
- Local text-to-speech (using Piper or similar)
- Local LLM for responses (using models like Llama 2, Mistral)
- Entirely self-contained system
- Offline-capable (no internet required after initial setup)

### Privacy Model: Tier 3 - Completely Local & Private

**What's different:**
- Zero external API calls during conversation
- All processing happens on user's device or self-hosted backend
- No data ever leaves the user's infrastructure
- Cryptographic verification of model integrity

**Security measures:**
- End-to-end encrypted if using shared backend
- No third-party access to any conversation data
- User has full control of data deletion
- Open-source components (community auditable)

**User expectations:**
- Complete privacy guarantee
- Compliance with strictest privacy regulations (GDPR, HIPAA, etc.)
- No tracking, no analytics, no data sales
- Suitable for highly sensitive conversations (medical, legal, financial)

**Trade-offs:**
- Slower responses (local LLMs are less powerful than GPT-4)
- Larger device storage requirements (models are 1-20GB)
- Requires more powerful hardware
- Setup more complex for end users
- Less accurate transcription (Whisper vs. Google Cloud)

**Target users:**
- Privacy-conscious developers
- Enterprise with strict data residency requirements
- Regulated industries (healthcare, legal)
- Users who want complete autonomy

---

## Core Components

- **Phone Gateway**: Twilio Voice integration
- **Backend Service**: Handles call routing, orchestration, and AI logic
- **Speech Processing**: Speech-to-text and text-to-speech services
- **AI Engine**: Conversational AI backbone
- **Database**: Supabase (transcripts, summaries, notes)
- **Mobile App**: Timeline view and note organization
- **Summarization Service**: Automatic key point extraction

---

## Technical Stack (Preliminary)

- **Phone Service**: Twilio
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Frontend**: React Native (mobile)
- **AI**: OpenAI API (Phase 1-2), Local LLMs (Phase 3)
- **Speech Services**: Google Cloud Speech-to-Text & Text-to-Speech (Phase 1-2), Whisper & Piper (Phase 3)

---

## Next Steps

1. ✅ Define folder architecture (complete)
2. ✅ Plan privacy model (complete)
3. ✅ Create roadmap with phases (complete)
4. Bootstrap individual workspaces with package.json
5. Plan database schema
6. Begin backend scaffolding
7. Initialize React Native mobile app
8. Design API contracts
