# Backend Implementation Guide - Phase 2

## Overview
This guide covers the three major implementations added to Emmaline:
1. JWT Authentication System
2. Mobile API Client Service
3. Twilio Integration

---

## 1. JWT Authentication System

### Backend Files Created/Updated:
- `backend/src/services/authService.js` (NEW)
- `backend/src/middleware/auth.js` (UPDATED)
- `backend/src/routes/auth.js` (UPDATED)
- `backend/package.json` (UPDATED - added `jsonwebtoken` and `bcryptjs`)

### How It Works:

#### Registration Flow:
```
1. User submits email + password
2. Password validated (min 8 chars)
3. Check if email already exists
4. Hash password with bcryptjs (10 rounds)
5. Store user in Supabase `users` table
6. Generate JWT token with userId and email
7. Return token + user info
8. Mobile stores token securely
```

#### Login Flow:
```
1. User submits email + password
2. Fetch user from `users` table by email
3. Compare password with bcrypt (constant-time comparison)
4. Generate JWT token if match
5. Return token + user info
6. Mobile stores token securely
```

#### Protected Requests:
```
1. Mobile includes token in Authorization header: "Bearer <token>"
2. authMiddleware intercepts request
3. verifyToken() decodes JWT using JWT_SECRET
4. Attaches decoded user info to req.user
5. Route handler uses req.user.userId for database queries
```

### API Endpoints:

#### `POST /api/auth/register`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "eyJhbGc..."
}
```

**Error Responses:**
- `400`: Missing email/password
- `400`: Password less than 8 chars
- `409`: Email already registered
- `500`: Registration failed

---

#### `POST /api/auth/login`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "eyJhbGc..."
}
```

**Error Responses:**
- `400`: Missing email/password
- `401`: Invalid email/password
- `500`: Login failed

---

#### `POST /api/auth/refresh`
**Headers:**
```
Authorization: Bearer <current-token>
```

**Success Response (200):**
```json
{
  "message": "Token refreshed",
  "token": "eyJhbGc..."
}
```

---

#### `GET /api/auth/me`
**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2025-02-26T..."
  }
}
```

---

### Environment Variables Required:
```env
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=7d
```

---

## 2. Mobile API Client Service

### Mobile Files Created/Updated:
- `mobile/src/services/api.js` (NEW)
- `mobile/src/utils/secureStorage.js` (NEW)
- `mobile/package.json` (UPDATED - added `expo-secure-store`)

### Architecture:

#### Secure Token Storage:
```
↓ Secure Storage ↓
expo-secure-store (iOS Keychain / Android Keystore)
↓
Token never visible to:
- System logs
- Clipboard
- File system (in plaintext)
↓
Only accessible by app
```

#### API Client Structure:
```
┌─────────────────────────────────┐
│   React Native Screens          │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│   api.js (API Client)           │
│ - Add token to headers          │
│ - Handle auth state             │
│ - Auto-refresh tokens (TODO)    │
│ - Error handling                │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│   axios (HTTP Client)           │
│ - Timeout management            │
│ - Request/response interceptors │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│   Backend (Express)             │
└─────────────────────────────────┘
```

### Authentication Methods:

```javascript
// Register new user
const result = await registerUser(email, password);
if (result.success) {
  // Token automatically stored & headers updated
  // User can now make authenticated requests
}

// Login existing user
const result = await loginUser(email, password);
if (result.success) {
  // Token automatically stored & headers updated
}

// Get current user
const result = await getCurrentUser();

// Refresh token
const result = await refreshAuthToken();

// Logout
const result = await logoutUser();
// Token removed from storage & headers cleared
```

### Call Methods:

```javascript
// Get all calls (paginated)
const result = await getCalls(limit, offset);
// Returns: { success, calls, total }

// Get specific call
const result = await getCallDetail(callId);
// Returns: { success, call }

// Initiate new call
const result = await initiateCall();
// Returns: { success, call, phoneNumber, sessionId }

// End active call
const result = await endCall(callId);
// Returns: { success, call }

// Get transcript
const result = await getTranscript(callId);
// Returns: { success, transcript }

// Get summary
const result = await getCallSummary(callId);
// Returns: { success, summary }
```

### Note Methods:

```javascript
// Get notes (optionally filtered by topic)
const result = await getNotes(topic, limit, offset);
// Returns: { success, notes, total }

// Get all topics
const result = await getTopics();
// Returns: { success, topics }

// Create note
const result = await createNote(title, content, topic);
// Returns: { success, note }

// Update note
const result = await updateNote(noteId, title, content, topic);
// Returns: { success, note }

// Delete note
const result = await deleteNote(noteId);
// Returns: { success, message }

// Create note from call
const result = await createNoteFromCall(callId, title);
// Returns: { success, note }
```

### Usage in Screens:

```javascript
import * as api from '../services/api.js';

export const LoginScreen = () => {
  const handleLogin = async (email, password) => {
    const result = await api.loginUser(email, password);
    if (result.success) {
      // Navigate to home
    } else {
      // Show error: result.error
    }
  };
};

export const TranscriptScreen = () => {
  const loadTranscripts = async () => {
    const result = await api.getCalls(50, 0);
    if (result.success) {
      setCalls(result.calls);
    }
  };
};

export const CreateNoteScreen = () => {
  const handleSave = async (title, content, topic) => {
    const result = await api.createNote(title, content, topic);
    if (result.success) {
      // Note saved, navigate back
    }
  };
};
```

### Error Handling Pattern:

```javascript
const result = await api.someFunction();

if (result.success) {
  // Handle success
  console.log(result.data);
} else {
  // Handle error
  Alert.alert('Error', result.error);
}
```

---

## 3. Twilio Integration

### Backend Files Updated:
- `backend/src/services/twilioService.js` (UPDATED)
- `backend/src/routes/twilio.js` (UPDATED)

### How Twilio Integration Works:

#### Incoming Call Flow:
```
┌─────────────┐
│  Phone Call │
└──────┬──────┘
       ↓ (Twilio receives call)
┌──────────────────────────┐
│ Twilio Webhook POST      │
│ /api/twilio/webhook      │
└──────┬───────────────────┘
       ↓ (Verify request signature)
┌──────────────────────────────────┐
│ verifyTwilioRequest middleware   │
│ Validates X-Twilio-Signature     │
└──────┬───────────────────────────┘
       ↓ (Identify user from context)
┌──────────────────────────────────┐
│ handleIncomingCall()             │
│ - Save call record to DB         │
│ - Generate TwiML response        │
└──────┬───────────────────────────┘
       ↓ (Return TwiML)
┌──────────────────────────────────┐
│ Response: TwiML with <Connect>   │
│ Stream connects to WebSocket     │
│ (Real-time media streaming)      │
└──────────────────────────────────┘
```

#### Outbound Call Flow:
```
┌──────────────────┐
│ Mobile App User  │
│ Taps Call Button │
└────────┬─────────┘
         ↓
┌──────────────────────────┐
│ POST /api/twilio/initiate│
│ (Authenticated)          │
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│ initiateOutboundCall()   │
│ - Create call record     │
│ - Generate phone number  │
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│ Response: Phone Number   │
│ "Call this number"       │
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│ User dials from phone    │
│ Twilio receives call     │
└────────┬─────────────────┘
         ↓
│ Webhook /api/twilio/webhook
│ Call is connected
└──────────────────────────┘
```

#### Call Status Updates:
```
Twilio sends status updates:
- queued
- ringing
- in-progress
- completed
- busy
- failed
- no-answer
- canceled

→ /api/twilio/call-status webhook
→ handleCallStatus() updates database
```

### API Endpoints:

#### `POST /api/twilio/webhook`
**Called by Twilio when call comes in**

**Payload:**
```
CallSid - Unique call ID from Twilio
From - Caller phone number
To - Called phone number
CallStatus - Current status
```

**Response:**
- TwiML XML response that tells Twilio how to handle call

---

#### `POST /api/twilio/call-status`
**Called by Twilio when call status changes**

**Payload:**
```
CallSid - Call ID
CallStatus - New status
CallDuration - Call duration in seconds
```

**Response:**
```json
{
  "success": true
}
```

---

#### `POST /api/twilio/initiate`
**Called by mobile app to start a call**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "call": {
    "id": "uuid",
    "sessionId": "uuid"
  },
  "phoneNumber": "+1234567890",
  "instructions": "Call +1234567890 from your phone"
}
```

---

### Security Features:

1. **Request Signature Verification**
   - Twilio signs all webhooks with timestamp
   - Server verifies signature using `X-Twilio-Signature` header
   - Prevents unauthorized requests

2. **User Authentication**
   - `/initiate` endpoint requires JWT token
   - User ID extracted from token
   - Call is associated with authenticated user

3. **Database Recording**
   - All calls logged with:
     - User ID
     - Twilio Call SID
     - Phone numbers
     - Duration
     - Status

---

### Environment Variables Required:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
WEBHOOK_URL=https://yourdomain.com
MEDIA_STREAM_URL=wss://yourdomain.com/api/twilio/media-stream
```

---

## Next Steps (TODO)

### High Priority:
1. **WebSocket Media Streaming**
   - Install `ws` library
   - Implement real-time audio handling
   - Connect to Google Cloud Speech-to-Text

2. **Speech-to-Text Integration**
   - Configure Google Cloud credentials
   - Stream audio chunks from Twilio
   - Process continuous speech recognition

3. **AI Response Generation**
   - Send transcribed text to OpenAI
   - Get response based on system prompt
   - Handle streaming responses

4. **Text-to-Speech**
   - Convert AI response to audio
   - Stream back through Twilio media stream
   - Handle audio encoding/decoding

5. **Transcript Storage**
   - Save full transcript to database
   - Store speaker labels (User/AI)
   - Enable transcript search

### Medium Priority:
1. Call summarization after completion
2. Key points extraction
3. Sentiment analysis
4. Action items identification
5. Topic tagging

### Low Priority:
1. Call recording (requires Twilio plan)
2. Call transcription (use built-in or third-party)
3. Analytics and metrics
4. Advanced error handling

---

## Testing Checklist

### Authentication:
- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Reject invalid credentials
- [ ] Refresh token before expiry
- [ ] Token persists across app restart
- [ ] Logout clears token

### API Client:
- [ ] All methods return { success, data } or { success: false, error }
- [ ] Token automatically added to requests
- [ ] Token refresh on 401 response (TODO)
- [ ] Timeout handling after 30 seconds
- [ ] Network error handling

### Twilio:
- [ ] Webhook signature verification works
- [ ] Incoming call creates database record
- [ ] Call status updates update database
- [ ] Initiate call returns phone number
- [ ] Outbound call connects properly

---

## Deployment Notes

1. **Set strong JWT_SECRET** - Use cryptographically random string
2. **Enable HTTPS** - Required for Twilio webhooks
3. **Configure WEBHOOK_URL** - Must be publicly accessible
4. **Set TWILIO_PHONE_NUMBER** - Register phone number in Twilio
5. **Store secrets in environment** - Never commit API keys
6. **Enable database RLS** - Supabase security policies active
7. **Monitor Twilio logs** - Check webhook delivery
