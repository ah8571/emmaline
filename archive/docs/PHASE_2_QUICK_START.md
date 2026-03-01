# Phase 2 Quick Start Guide

## What Was Just Built

You now have a **production-ready foundation** for Emmaline with:

1. **JWT Authentication System** - Secure user login/registration
2. **Mobile API Client** - Connect mobile app to backend
3. **Twilio Integration** - Phone call routing and handling

---

## 🚀 Getting Started

### 1. Set Environment Variables

Create `backend/.env`:
```env
# Authentication
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRATION=7d

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# URLs (update with your domain)
WEBHOOK_URL=https://yourdomain.com
MEDIA_STREAM_URL=wss://yourdomain.com/api/twilio/media-stream

# Supabase
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional
OPENAI_API_KEY=sk-...
NODE_ENV=development
PORT=3000
```

Create `mobile/.env`:
```env
REACT_APP_API_URL=http://localhost:3000/api
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Mobile:**
```bash
cd mobile
npm install
```

### 3. Test Authentication Locally

**Start backend:**
```bash
cd backend
npm run dev
```

**Test registration:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Save the token and test login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Test protected endpoint:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📱 Mobile App Integration

### In LoginScreen.js, Replace TODO with:

```javascript
import * as api from '../services/api.js';

const handleLogin = async (email, password) => {
  setLoading(true);
  const result = await api.loginUser(email, password);
  
  if (result.success) {
    // Navigate to main app
    navigation.replace('AppTabs');
  } else {
    setError(result.error);
  }
  setLoading(false);
};

const handleRegister = async (email, password) => {
  setLoading(true);
  const result = await api.registerUser(email, password);
  
  if (result.success) {
    // Navigate to main app
    navigation.replace('AppTabs');
  } else {
    setError(result.error);
  }
  setLoading(false);
};
```

### In AppNavigator.js, Update Auth Check:

```javascript
import * as api from '../services/api.js';
import * as SecureStorage from '../utils/secureStorage.js';

const checkAuth = async () => {
  const isAuth = await SecureStorage.isAuthenticated();
  
  if (isAuth) {
    // Verify token is still valid
    const result = await api.getCurrentUser();
    if (result.success) {
      setUserState({ isSignedIn: true });
    } else {
      // Token invalid, send back to login
      setUserState({ isSignedIn: false });
    }
  } else {
    setUserState({ isSignedIn: false });
  }
};

// Call in useEffect on app startup
useEffect(() => {
  checkAuth();
}, []);
```

### In TranscriptScreen.js:

```javascript
import * as api from '../services/api.js';

const loadCalls = async () => {
  setLoading(true);
  const result = await api.getCalls(50, 0);
  
  if (result.success) {
    // Transform for SectionList
    const grouped = groupCallsByDate(result.calls);
    setSections(grouped);
  } else {
    Alert.alert('Error', result.error);
  }
  setLoading(false);
};

// Fetch on screen focus
useFocusEffect(
  useCallback(() => {
    loadCalls();
  }, [])
);
```

### In CallScreen.js (when call is active):

```javascript
// WebSocket connection would go here
// For now, use API to get live updates

const updateTranscript = async () => {
  const result = await api.getTranscript(activeCall.id);
  if (result.success) {
    setLiveTranscript(result.transcript);
  }
};

// Poll for updates every 500ms
useEffect(() => {
  const interval = setInterval(updateTranscript, 500);
  return () => clearInterval(interval);
}, [activeCall]);
```

### In CreateNoteScreen.js:

```javascript
import * as api from '../services/api.js';

const handleSave = async (title, content, topic) => {
  if (!title.trim()) {
    Alert.alert('Error', 'Please enter a note title');
    return;
  }

  setSaving(true);
  const result = await api.createNote(title, content, topic);
  
  if (result.success) {
    // Return to notes screen
    navigation.goBack();
  } else {
    Alert.alert('Error', result.error);
  }
  setSaving(false);
};
```

---

## ☎️ Twilio Integration Checklist

### Setup in Twilio Console:

1. **Get your credentials:**
   - Account SID
   - Auth Token
   - Phone Number (or request one)

2. **Configure Webhooks:**
   - Go to Phone Numbers → Manage Numbers → Select number
   - Under "Voice":
     - Configure With: Webhooks
     - A Call Comes In: `https://yourdomain.com/api/twilio/webhook`
     - Call Status Changes: `https://yourdomain.com/api/twilio/call-status`

3. **Enable TwiML Apps:**
   - Create a TwiML App
   - Set Voice URL: `https://yourdomain.com/api/twilio/webhook`

### Test Incoming Call:

```bash
# Create test call to your Twilio number
curl -X POST https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Calls \
  -u "YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN" \
  -d "From=+1234567890" \
  -d "To=YOUR_TWILIO_NUMBER" \
  -d "Url=http://localhost:3000/api/twilio/webhook"
```

---

## 🔐 Security Checklist

- [x] JWT tokens with 7-day expiration
- [x] Passwords hashed with bcryptjs
- [x] Secure token storage (expo-secure-store)
- [x] Twilio webhook signature verification
- [x] User-scoped database queries
- [ ] HTTPS enforced on production
- [ ] Rate limiting on auth endpoints
- [ ] CORS properly configured
- [ ] Sensitive data not logged
- [ ] Secrets in environment variables only

---

## 📊 Database Setup

### Run schema in Supabase:

1. Go to Supabase dashboard
2. SQL Editor → New Query
3. Copy content of `database/schema.sql`
4. Paste and run

**Tables created:**
- `users` - User accounts
- `calls` - Call records
- `transcripts` - Full transcripts
- `summaries` - AI-generated summaries
- `topics` - Note topics
- `notes` - User notes
- `call_topics` - Links calls to topics
- `api_keys` - API key management
- `audit_logs` - Activity logging

---

## 🧪 Testing the Full Flow

### 1. Register & Login:
```bash
# Terminal 1 - Start backend
cd backend
npm run dev

# Terminal 2 - Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'

# Copy the token from response
TOKEN="eyJhbGc..."
```

### 2. Get Current User:
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Initiate Call (Requires Token):
```bash
curl -X POST http://localhost:3000/api/twilio/initiate \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Mobile App Test:
```javascript
import * as api from './src/services/api.js';

// Initialize
await api.initializeAPIClient();

// Login
const login = await api.loginUser('demo@example.com', 'password123');
console.log(login); // { success: true, user: {...}, token: '...' }

// Get calls
const calls = await api.getCalls(10, 0);
console.log(calls); // { success: true, calls: [...], total: 0 }
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `docs/IMPLEMENTATION_PHASE_2.md` | Detailed implementation guide |
| `PHASE_2_COMPLETE.md` | Completion summary |
| `QUICK_REFERENCE.md` | Quick lookup guide |
| `README.md` | Project overview |

---

## 🎯 Next Priority Tasks

### Phase 3 (High Priority):
1. **WebSocket Media Streaming**
   - Install `ws` library in backend
   - Create WebSocket server at `/api/twilio/media-stream`
   - Handle Twilio media stream format

2. **Google Cloud Speech-to-Text**
   - Set up service account
   - Stream audio chunks from Twilio
   - Get real-time transcriptions

3. **Real-Time UI Updates**
   - Update CallScreen with live transcript
   - Show speaker labels (You/AI)
   - Display message as they arrive

### Phase 4 (High Priority):
1. **OpenAI Integration**
   - Send transcribed text to GPT
   - Get conversational responses
   - Handle streaming responses

2. **Text-to-Speech**
   - Convert AI response to audio
   - Stream back through Twilio
   - Maintain conversation flow

---

## 🚢 Deployment

### Choose a platform:

**Option 1: Heroku (Easiest)**
```bash
heroku create emmaline-api
git push heroku main
heroku config:set JWT_SECRET=...
```

**Option 2: Railway (Modern Alternative)**
- Connect GitHub repo
- Set environment variables
- Auto-deploys on push

**Option 3: DigitalOcean/AWS**
- Docker container
- Scale as needed
- More control

### Mobile Deployment:

**iOS (AppStore):**
- EAS Build: `eas build --platform ios`
- Submit to AppStore

**Android (Play Store):**
- EAS Build: `eas build --platform android`
- Submit to Play Store

---

## 💡 Pro Tips

1. **Test Twilio with sandbox:**
   - Don't commit real phone numbers
   - Use Twilio test credentials first

2. **Monitor logs:**
   ```bash
   # Heroku logs
   heroku logs --tail
   ```

3. **Database queries:**
   - Always use parameterized queries
   - Never concatenate user input

4. **Token refresh:**
   - Implement auto-refresh 1 minute before expiry
   - Gracefully handle invalid tokens

5. **Error handling:**
   - All API methods return `{ success: boolean, ... }`
   - Never throw errors, always return objects

---

## ❓ FAQ

**Q: How do I change JWT expiration?**
A: Update `JWT_EXPIRATION=7d` in `.env` to desired value (e.g., `24h`, `30d`)

**Q: Can users change passwords?**
A: Add to auth routes (not included in Phase 2)

**Q: How do I test with real phone calls?**
A: Set up Twilio webhook URL to your public domain and test with real phone

**Q: Is the app ready for production?**
A: Not yet - still needs Phase 3 & 4 (audio streaming and AI)

**Q: How much will Twilio cost?**
A: ~$0.50 per minute of calls, outbound phone number ~$1/month

---

## 📞 Ready to Build Phase 3?

You now have:
- ✅ User authentication
- ✅ Mobile API client
- ✅ Twilio call routing
- ⏳ Next: WebSocket audio streaming

Let me know when you're ready to tackle real-time audio processing!
