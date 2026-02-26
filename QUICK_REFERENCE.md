# Emmaline Quick Reference

## Folder Locations

| Component | Location |
|-----------|----------|
| **Concept/Vision** | [docs/CONCEPT.md](docs/CONCEPT.md) |
| **Architecture** | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| **Backend Server** | [backend/src/index.js](backend/src/index.js) |
| **Twilio Routes** | [backend/src/routes/twilio.js](backend/src/routes/twilio.js) |
| **Database Schema** | [database/schema.sql](database/schema.sql) |
| **Mobile Screens** | [mobile/src/screens/](mobile/src/screens/) |
| **Mobile Components** | [mobile/src/components/](mobile/src/components/) |

## Common Commands

### Start Development

```bash
# Terminal 1: Backend server (port 3000)
npm run dev --workspace=backend

# Terminal 2: Mobile app (with Expo)
npm start --workspace=mobile

# Install all dependencies (do this first)
npm install
```

### Database

```bash
# Deploy schema to Supabase
# 1. Go to Supabase Dashboard
# 2. SQL Editor
# 3. Paste contents of database/schema.sql
# 4. Run
```

### Environment Setup

```bash
# Copy template
cp .env.example .env

# Fill in:
# - TWILIO_* credentials
# - SUPABASE_* credentials
# - OPENAI_API_KEY
# - GOOGLE_CLOUD_* credentials
```

## Implementation Priority

### Must Do First
1. ✅ Create Twilio account (while we code)
2. ✅ Create Supabase account
3. ✅ Get OpenAI API key
4. ✅ Set up Google Cloud (optional for MVP, can use alternatives)
5. 🔄 Fill in `.env` file

### Phase 1 Implementation Order
1. Twilio webhook handler → Live call acceptance
2. Speech-to-text integration → Capture user words
3. AI response generator → Generate intelligent replies
4. Text-to-speech → Speak responses back
5. Transcript saving → Store in database
6. Summary generation → Extract key points
7. API endpoints → Connect mobile to backend
8. Mobile authentication → User login/register

## File You'll Edit Most

| File | What It Does | Status |
|------|-------------|--------|
| `backend/src/routes/twilio.js` | Handle incoming calls | 🔄 TODO |
| `backend/src/services/aiService.js` | AI responses | 🔄 TODO |
| `backend/src/services/databaseService.js` | DB queries | ✅ Started |
| `mobile/src/screens/TimelineScreen.js` | Call history | ✅ Layout ready |
| `mobile/src/services/api.js` | Backend API client | 🔄 TODO |
| `.env` | All credentials | 🔄 TODO |

## Key Concepts to Remember

**Data Flow (During a Call):**
```
User calls number
    ↓
Twilio → Your Backend
    ↓
Speech-to-Text (Google)
    ↓
AI Response (OpenAI)
    ↓
Text-to-Speech (Google)
    ↓
Audio back to user
    ↓
Save transcript + summary to Supabase
    ↓
Show in mobile app
```

**Privacy Tiers:**
- **Phase 1** (MVP): Cloud with encryption ✅
- **Phase 2**: Enhanced + local options 🔄
- **Phase 3**: Completely local 🔄

## Troubleshooting Quick Links

**Twilio setup issues?**
→ See [backend/SETUP.md](backend/SETUP.md) "Twilio Setup" section

**Database not working?**
→ See [backend/SETUP.md](backend/SETUP.md) "Database Setup" section

**Mobile won't start?**
→ See [mobile/SETUP.md](mobile/SETUP.md) "Troubleshooting" section

**Backend crashes?**
→ Check that all `.env` variables are filled in

## Links You'll Need

- **Twilio Console**: https://www.twilio.com/console
- **Supabase Dashboard**: https://app.supabase.com
- **OpenAI API**: https://platform.openai.com
- **Google Cloud Console**: https://console.cloud.google.com
- **GitHub (this repo)**: Your repository URL

## Next Conversation

When you're ready to start building, tell me:

1. ✅ "I've set up Twilio, here are my credentials"
2. ✅ "I've created Supabase project"
3. 🤔 "What should I implement first?"

Or jump right to: *"Let's implement the Twilio webhook handler"*

---

**You're all set up! Ready to build!** 🚀
