# Emmaline Backend Setup Guide

## Prerequisites

- Node.js 18+
- npm 8+
- Twilio account with credentials
- Supabase project
- OpenAI API key
- Google Cloud project (for Speech-to-Text & Text-to-Speech)

## Installation

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Create a `.env` file:

```bash
cp ../.env.example .env
```

Fill in all required values:

```
# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# OpenAI
OPENAI_API_KEY=your_openai_key

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_CREDENTIALS_PATH=./path/to/credentials.json

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Backend
NODE_ENV=development
PORT=3000
BACKEND_URL=http://localhost:3000
```

### 3. Database Setup

Run migrations in Supabase:

```bash
# Option 1: Use Supabase Dashboard
# Go to SQL Editor and paste contents of database/schema.sql

# Option 2: Use Supabase CLI (if installed)
supabase db push
```

### 4. Start the server

**Development with auto-reload:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will run on `http://localhost:3000`

## Project Structure

```
src/
├── index.js           # Express app entry point
├── routes/            # API route handlers
│   ├── twilio.js             # Twilio webhooks
│   ├── calls.js              # Call management
│   ├── notes.js              # Note management
│   └── auth.js               # Authentication
├── controllers/       # Business logic
├── services/          # External service integration
│   ├── twilioService.js      # Twilio operations
│   ├── databaseService.js    # Supabase queries
│   └── aiService.js          # OpenAI integration
├── middleware/        # Express middleware
│   ├── errorHandler.js       # Error handling
│   ├── logger.js             # Request logging
│   └── auth.js               # JWT verification
└── utils/             # Helper functions
```

## API Endpoints (TODO)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Calls
- `GET /api/calls` - Get all calls for user
- `GET /api/calls/:callId` - Get call details with transcript
- `DELETE /api/calls/:callId` - Delete a call

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create new note
- `PUT /api/notes/:noteId` - Update note
- `DELETE /api/notes/:noteId` - Delete note

### Twilio
- `POST /api/twilio/webhook` - Incoming call webhook
- `POST /api/twilio/media-stream` - WebSocket media stream

## Twilio Setup

1. **Create Twilio Account**
   - Sign up at [twilio.com](https://www.twilio.com)
   - Get Account SID and Auth Token from Console

2. **Get Phone Number**
   - Buy a phone number or use trial number
   - Add to `TWILIO_PHONE_NUMBER` in .env

3. **Configure Webhook**
   - In Twilio Console → Phone Numbers → Your Number
   - Set Voice webhook to: `https://your-domain.com/api/twilio/webhook`
   - Enable both "Voice Calls" and "Messages"

## Google Cloud Setup

1. **Create Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project

2. **Enable APIs**
   - Enable "Cloud Speech-to-Text API"
   - Enable "Cloud Text-to-Speech API"

3. **Create Service Account**
   - Go to Service Accounts
   - Create new service account with appropriate roles
   - Download JSON credentials file
   - Add path to `GOOGLE_CLOUD_CREDENTIALS_PATH` in .env

## Development Tips

- Server auto-reloads on file changes with `npm run dev`
- Check logs in terminal for request/error details
- Test endpoints with Postman or curl:

```bash
# Health check
curl http://localhost:3000/health

# Get all calls (requires auth header)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/calls
```

## Database Operations

### View data in Supabase
1. Go to Supabase Dashboard
2. Navigate to "SQL Editor" or "Data Browser"
3. Query or browse tables

### Run custom queries
```bash
# Connect with psql if you have PostgreSQL client
psql postgresql://user:password@host/database
```

## TODO Implementation Priority

1. **Phase 1 (MVP)**
   - [ ] Twilio webhook handling
   - [ ] Call recording and transcription
   - [ ] Transcript saving to DB
   - [ ] AI response generation
   - [ ] Text-to-speech playback
   - [ ] Summary generation
   - [ ] Basic API endpoints

2. **Phase 1.5 (Polish)**
   - [ ] User authentication (JWT)
   - [ ] Error handling improvements
   - [ ] Rate limiting
   - [ ] API documentation

3. **Phase 2**
   - [ ] Local summarization option
   - [ ] Advanced call filtering
   - [ ] Privacy dashboard
   - [ ] Data export functionality

## Troubleshooting

**Port 3000 already in use:**
```bash
# Change port in .env
PORT=3001
npm run dev
```

**Supabase connection errors:**
- Verify `SUPABASE_URL` and keys are correct
- Check network access rules in Supabase dashboard
- Ensure database schema is created

**OpenAI API errors:**
- Verify API key is valid
- Check account has available credits
- Review OpenAI documentation for rate limits

**Twilio connection issues:**
- Verify credentials are correct
- Check webhook URL is publicly accessible
- Test webhook in Twilio Dashboard → Debugger

## Resources

- [Twilio Voice Docs](https://www.twilio.com/docs/voice)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/client-library)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [Google Cloud Speech-to-Text](https://cloud.google.com/speech-to-text/docs)
