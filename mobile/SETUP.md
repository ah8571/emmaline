# Emmaline Mobile App Setup Guide

## Prerequisites

- Node.js 16+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`

## Installation

### 1. Install dependencies

```bash
cd mobile
npm install
```

### 2. Environment Setup

Create a `.env` file in the mobile directory:

```bash
cp ../env.example .env
```

Update with your backend URL:
```
REACT_NATIVE_BACKEND_URL=http://your-backend-url:3000
```

### 3. Start the app

**With Expo (Recommended for MVP):**
```bash
npm start
```

Then:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator  
- Or scan QR code with Expo Go app on your phone

**For web:**
```bash
npm run web
```

## Project Structure

```
src/
├── screens/           # Full-page components
│   ├── TimelineScreen.js     # Call history/timeline
│   ├── NotesScreen.js        # User notes
│   └── CallDetailScreen.js   # Individual call detail
├── components/        # Reusable UI components
│   ├── CallButton.js         # Call initiation button
│   ├── CallCard.js           # Call preview card
│   └── NoteCard.js           # Note preview card
├── services/          # API calls and data
│   └── api.js               # Backend API client
├── context/           # Global state
│   └── AuthContext.js       # User auth state
├── hooks/             # Custom React hooks
├── theme/             # Styling and constants
└── App.js             # Root component
```

## Key Components

### TimelineScreen
- Displays list of all calls in chronological order
- Shows call summary and metadata
- Green call button to initiate new call
- Tap to view call details

### NotesScreen
- Displays all user notes
- Create new notes button
- View and edit notes
- Filter/search (future)

### CallButton
- Floating action button
- Triggers phone call
- Green color for "call in progress"

## TODO Items

- [ ] Implement API service (api.js)
- [ ] Add authentication flows (login, register)
- [ ] Connect to Supabase for real-time updates
- [ ] Implement call initiation UI
- [ ] Add note creation/editing screens
- [ ] Search and filter functionality
- [ ] Dark mode support
- [ ] Offline support

## Development Tips

- Hot reload works with Expo - save and changes appear instantly
- Use React DevTools browser extension for debugging
- Check `metro` output in terminal for bundle issues
- Use `expo logs` to see console.log() output

## Building for Production

### EAS Build (Recommended)

```bash
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

### Local build

```bash
npm run eject  # Only if you need bare React Native
```

## Troubleshooting

**Metro bundler crashing:**
```bash
npm start --reset-cache
```

**Clear node_modules:**
```bash
rm -rf node_modules
npm install
```

**Port 8081 already in use:**
```bash
npm start -- -p 8090
```

## Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
