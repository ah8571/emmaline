# Emmaline: AI Phone Call Buddy

Monorepo for a hands-free AI assistant accessible via phone call. Users can speak with an AI while multitasking, with automatic transcription, summarization, and note-taking.

## Repository Structure

```
emmaline/
├── backend/                  # Node.js Express server
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── controllers/      # Business logic
│   │   ├── services/        # External service integrations (Twilio, OpenAI, etc.)
│   │   ├── middleware/      # Authentication, error handling
│   │   ├── utils/           # Helper functions
│   │   └── index.js         # Entry point
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
├── mobile/                   # React Native app
│   ├── src/
│   │   ├── screens/         # Call timeline, notes, detail views
│   │   ├── components/      # Reusable UI components
│   │   ├── services/        # API calls, local storage
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # Global state management
│   │   ├── navigation/      # Navigation config
│   │   ├── theme/           # Styling, constants
│   │   └── App.js           # Entry point
│   ├── assets/
│   ├── .env.example
│   └── package.json
│
├── services/                 # Shared business logic
│   ├── transcription/       # Speech-to-text logic
│   ├── summarization/       # AI summarization logic
│   ├── ai/                  # AI response generation
│   └── index.js
│
├── database/                 # Database schema & migrations
│   ├── migrations/          # Supabase migrations
│   ├── schema.sql           # Full schema definition
│   └── seeds/               # Sample data
│
├── shared/                   # Shared types, constants, utilities
│   ├── types.js             # Shared TypeScript/JSDoc types
│   ├── constants.js         # App-wide constants
│   ├── utils.js             # Utility functions
│   └── package.json
│
├── docs/                     # Documentation
│   ├── CONCEPT.md           # Project overview
│   ├── ARCHITECTURE.md      # Technical architecture
│   ├── API.md               # API documentation
│   └── SETUP.md             # Developer setup guide
│
├── .gitignore
├── .env.example             # Root env template
├── package.json             # Root monorepo config (npm workspaces)
└── README.md                # This file
```

## Tech Stack

- **Backend**: Node.js + Express
- **Mobile**: React Native (Expo or bare workflow)
- **Database**: Supabase (PostgreSQL)
- **Phone Service**: Twilio
- **AI**: OpenAI API
- **Speech Services**: Google Cloud Speech-to-Text & Text-to-Speech
- **Package Manager**: npm with workspaces

## Getting Started

### Prerequisites
- Node.js 18+
- npm 8+ (for workspaces support)
- Twilio account
- Supabase account
- OpenAI API key

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repo-url>
   cd emmaline
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your keys
   ```

3. **Set up database**
   ```bash
   cd database
   # Run migrations in Supabase dashboard or using Supabase CLI
   ```

4. **Start backend**
   ```bash
   npm run dev --workspace=backend
   ```

5. **Start mobile app**
   ```bash
   npm run start --workspace=mobile
   ```

## Project Phases

### Phase 1 (MVP)
- Twilio phone integration
- Live speech-to-text and AI response
- Basic transcription storage
- Call summary extraction
- Timeline view in mobile app

### Phase 2+
- OpenClaw ecosystem integration
- Email sorting/summarization
- Code project initiation
- Advanced developer features

## Documentation

- [Concept & Vision](docs/CONCEPT.md)
- Architecture (coming soon)
- API Docs (coming soon)
- Setup Guide (coming soon)

## Contributing

(Guidelines TBD)

## License

(TBD)
