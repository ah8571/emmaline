# Emmaline Mobile App - Screen Guide

## Updated App Flow

```
┌─────────────────────────────────────────┐
│        LoginScreen                      │
│  • Email/Password Input                 │
│  • Create Account / Sign In             │
│  • Beautiful onboarding                 │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│         AppTabs Navigation              │
│  ┌──────────┐      ┌──────────┐       │
│  │ 🎙️      │      │ 📝      │       │
│  │Transcripts   │      │Notes       │       │
│  └──────────┘      └──────────┘       │
│                                       │
│     + Floating Call Button (📞)      │
└──────┬─────────────────────────────┬──┘
       │                             │
       ▼                             ▼
┌──────────────────┐    ┌──────────────────┐
│TranscriptScreen  │    │NotesScreen       │
│• All transcripts │    │• Notes by topic  │
│• Grouped by date │    │• Create new note │
│• Tap to view     │    │• Filter by topic │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│CallDetailScreen  │    │CreateNoteScreen  │
│• Full transcript │    │• Edit note title │
│• Summary         │    │• Add content     │
│• Key points      │    │• Select topic    │
│• Action items    │    │• Save            │
└──────────────────┘    └──────────────────┘
         ▲
         │ (from Floating Button)
         │
┌──────────────────┐
│CallScreen        │
│• Live call UI    │
│• Real-time STT   │
│• Transcript      │
│• End call        │
└──────────────────┘
```

---

## Screen Details

### 1. LoginScreen
**Purpose:** User authentication

**Features:**
- Email input field
- Password input field
- "Sign In" / "Create Account" toggle
- Error message display
- Loading state during auth
- Beautiful header with app name and emoji

**User Actions:**
- Enter credentials
- Toggle between login/signup
- Submit form

**TODO Items:**
- [ ] Connect to backend authentication
- [ ] Store JWT token securely
- [ ] Implement auto-login from secure storage

---

### 2. TranscriptScreen (Transcripts Tab)
**Purpose:** View all recorded call transcripts

**Features:**
- Transcripts grouped by date (Today, Yesterday, dates)
- Each transcript shows:
  - Call time (HH:MM)
  - Duration in seconds
  - Preview of transcript/summary (2 lines)
- Section headers for easy date navigation
- Empty state with emoji and message
- Pull-to-refresh capability

**User Actions:**
- Scroll through transcripts
- Tap transcript to view full details
- Pull to refresh list

**TODO Items:**
- [ ] Connect to backend API (GET /api/calls)
- [ ] Implement pull-to-refresh
- [ ] Add search/filter capability
- [ ] Add delete functionality

---

### 3. NotesScreen (Notes Tab)
**Purpose:** View and organize notes by topic

**Features:**
- Topic filter tags at the top (scrollable)
- "All" tag to see everything
- Notes grouped by topic with section headers
- Each note shows:
  - Title
  - Preview of content (2 lines)
  - Creation date
- Create note button (+) in header
- Empty state with emoji

**User Actions:**
- Scroll through notes
- Tap topic filter to show only notes in that topic
- Tap "+" to create new note
- Tap note to view/edit

**TODO Items:**
- [ ] Fetch topics from backend
- [ ] Fetch notes and group by topic
- [ ] Implement topic filtering
- [ ] Add note deletion
- [ ] Add note search

---

### 4. CallDetailScreen
**Purpose:** View full call transcript and summary

**Features:**
- Call metadata (date, time, duration)
- Summary section with AI-generated overview
- Key points bulleted list
- Full transcript (searchable, copyable)
- Action items if extracted
- Sentiment indicator

**User Actions:**
- Read summary
- View full transcript
- Copy text (future)
- Create note from call (future)

**TODO Items:**
- [ ] Load call details from backend
- [ ] Display summary with formatting
- [ ] Show key points in bullet format
- [ ] Enable text selection/copy
- [ ] Add "Create Note from This Call" button

---

### 5. CallScreen (Active Call UI)
**Purpose:** Show live call interface during active conversation

**Features:**
- Header showing:
  - Close/End button
  - Status "Call in Progress"
  - Duration timer (MM:SS)
- Recording indicator (red dot + "Recording" text)
- Real-time transcript display:
  - Each line shows speaker (You / AI)
  - Color-coded speaker labels (blue for you, gray for AI)
  - Current spoken text shown in italics
- End Call button
- Success screen after call ends

**User Actions:**
- Watch real-time transcript as it comes in
- Close call mid-conversation
- End call normally
- See confirmation when saved

**TODO Items:**
- [ ] WebSocket connection for real-time STT
- [ ] Implement transcript streaming
- [ ] Connect AI response display
- [ ] Save transcript on call end
- [ ] Trigger summarization after call

---

### 6. CreateNoteScreen
**Purpose:** Create new note or edit existing

**Features:**
- Title input field
- Large content textarea
- Topic selector (future)
- Cancel and Save buttons in header
- Keyboard-aware layout

**User Actions:**
- Type note title
- Type note content
- (Future) Select topic
- Save or cancel

**TODO Items:**
- [ ] Add topic selector dropdown
- [ ] Connect to backend POST /api/notes
- [ ] Implement note editing (if passed note ID)
- [ ] Add rich text formatting (future)
- [ ] Add templates (future)

---

## Floating Call Button

**Position:** Bottom-right corner, fixed on all screens

**Features:**
- Green phone icon (📞)
- Bouncy animation on press
- Accessible from any screen
- Floats above tab navigation
- Subtle shadow effect

**User Actions:**
- Tap to initiate call
- Triggers CallScreen navigation

**TODO Items:**
- [ ] Request microphone permissions
- [ ] Connect to call backend
- [ ] Show loading state while connecting
- [ ] Handle errors gracefully

---

## Tab Navigation Structure

### Tab 1: Transcripts (🎙️)
- Shows all recorded transcripts
- Chronologically organized
- Links to transcript details

### Tab 2: Notes (📝)
- Shows all user notes
- Organized by topic
- Create new notes

---

## Color Scheme

| Element | Color | Usage |
|---------|-------|-------|
| Primary | #007AFF | Links, active states, inputs |
| Success | #28a745 | Call button, positive actions |
| Danger | #dc3545 | End call, delete |
| Background | #f8f9fa | Page backgrounds |
| Card | #ffffff | Content cards |
| Text Primary | #212529 | Main text |
| Text Secondary | #6c757d | Secondary text |
| Border | #e9ecef | Dividers |

---

## Typography

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| Page Title | 28 | 700 | Screen headers |
| Section Title | 18 | 600 | Section headers |
| Body | 14 | 400 | Normal text |
| Small | 12 | 400 | Secondary info |
| Input | 14 | 400 | Form fields |

---

## Component Hierarchy

```
App.js
├── AppNavigator
│   ├── LoginScreen (before auth)
│   └── AppTabs (after auth)
│       ├── TranscriptStack
│       │   ├── TranscriptScreen
│       │   └── CallDetailScreen
│       └── NotesStack
│           ├── NotesScreen
│           └── CreateNoteScreen
├── FloatingCallButton
│   └── CallScreen (overlay when active)
```

---

## User Journey Examples

### First-Time User
1. Land on LoginScreen
2. Create account or sign in
3. See empty TranscriptScreen
4. Tap floating call button
5. See CallScreen with live transcript
6. Call ends, saved in TranscriptScreen
7. Tap to view CallDetailScreen
8. Create note from call via NotesScreen

### Regular User
1. Open app, auto-login from secure token
2. See recent transcripts on TranscriptScreen
3. Tap phone button for a new call
4. After call, browse notes by topic
5. Create or update notes
6. View previous calls for reference

---

## Responsive Design

- **Tested on:** iPhone SE (375px), iPhone 12 (390px), iPhone 14 (430px)
- **Android:** Scales to various screen sizes
- **Landscape:** (TODO - future enhancement)

---

## Accessibility Features (TODO)

- [ ] VoiceOver support (iOS)
- [ ] TalkBack support (Android)
- [ ] Sufficient color contrast
- [ ] Touch target sizes ≥ 44pt
- [ ] Semantic labels for screen readers

---

## Next Implementation Steps

### Phase 1: Core Features
1. ✅ Create all screen layouts
2. 🔄 Connect authentication
3. 🔄 Implement call initiation
4. 🔄 Real-time transcript streaming
5. 🔄 Save transcripts and summaries

### Phase 2: Polish
1. 🔄 Add animations
2. 🔄 Implement error handling
3. 🔄 Add loading states
4. 🔄 Test all flows

### Phase 3: Enhancement
1. 🔄 Rich text editing
2. 🔄 Advanced filtering
3. 🔄 Export/sharing
4. 🔄 Dark mode
5. 🔄 Offline support
