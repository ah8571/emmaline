# In-App VoIP Rollout Checklist (Phase 1 Beta)

Goal: make in-app calling the primary UX, keep dialer as fallback, and hide the underlying phone number from end users.

---

## 0) Ownership Legend

- **[You/Twilio Console]**: best done in Twilio dashboard.
- **[Me/Code]**: backend/mobile implementation in repo.
- **[Both]**: coordinated verification.

---

## 1) Twilio Console Setup (Required)

1) Create a TwiML App (you currently have none)

Go to Twilio Console → Develop → Phone Numbers → TwiML Apps → Create new TwiML App.
Name: Emmaline VoIP (or similar).
Voice Request URL: https://emmaline.app/api/voice/connect
Method: HTTP POST
Save, then copy the TwiML App SID (starts with AP...).
2) Create Twilio API Key for Voice tokens

Go to Twilio Console → Account/Project settings → API Keys (or Keys & Credentials).
Create Standard API Key.
Copy:
API Key SID (starts with SK...)
API Key Secret (shown once only)
3) Set backend environment vars (DigitalOcean/backend)

TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_API_KEY_SID
TWILIO_API_KEY_SECRET
TWILIO_TWIML_APP_SID
WEBHOOK_URL = https://emmaline.app
WEBSOCKET_URL = wss://emmaline.app/ws/media-stream
Then redeploy backend.

### Account + Voice basics
- [ ] **[You/Twilio Console]** Verify Voice is enabled on your Twilio project.
- [ ] **[You/Twilio Console]** Confirm a Twilio phone number is active for inbound fallback.
- [ ] **[You/Twilio Console]** Set inbound webhook for that number to backend Twilio route (existing path used by this project).

### API credentials for client tokens
- [ ] **[You/Twilio Console]** Create an **API Key SID** + **API Key Secret** (for Access Token minting).
- [ ] **[You/Twilio Console]** Save these securely (do not commit to git).

### TwiML App for in-app Voice SDK calls
- [ ] **[You/Twilio Console]** Create a **TwiML App** (Voice).
- [ ] **[You/Twilio Console]** Set Voice Request URL to backend endpoint that will return call TwiML for client calls.
- [ ] **[You/Twilio Console]** Note the **TwiML App SID**.

### Optional for production quality
- [ ] **[You/Twilio Console]** Configure status callback URL for call lifecycle analytics.
- [ ] **[You/Twilio Console]** Review geographic permissions and fraud controls.

---

## 2) Backend Work (Token + Routing)

### Environment variables
- [ ] **[Me/Code]** Add env vars:
  - `TWILIO_API_KEY_SID`
  - `TWILIO_API_KEY_SECRET`
  - `TWILIO_TWIML_APP_SID`
  - Keep existing: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

### Token endpoint
- [ ] **[Me/Code]** Implement `POST /api/voice/token` (auth required).
- [ ] **[Me/Code]** Mint short-lived Twilio Access Token with Voice grant.
- [ ] **[Me/Code]** Use authenticated user id as client identity.

### Voice app endpoint (TwiML for client-originated calls)
- [ ] **[Me/Code]** Add endpoint for TwiML App request URL (e.g., `POST /api/voice/connect`).
- [ ] **[Me/Code]** Return TwiML that routes call into current AI media stream pipeline.
- [ ] **[Me/Code]** Ensure call metadata links to user/session records.

### Safety + observability
- [ ] **[Me/Code]** Add server logs for token issuance and call connect failures.
- [ ] **[Me/Code]** Add rate limiting on token endpoint.

---

## 3) Mobile Work (Primary In-App Call UX)

### Build/runtime requirements
- [ ] **[Both]** Move from Expo Go to **Expo Development Build** (native Voice SDK dependency).

### SDK integration
- [ ] **[Me/Code]** Integrate Twilio Voice SDK in mobile app.
- [ ] **[Me/Code]** Fetch token from `/api/voice/token`.
- [ ] **[Me/Code]** Start call via Voice SDK (not `tel:` dialer) as default path.

### Call-state UX
- [ ] **[Me/Code]** Add clear states: `connecting`, `live`, `ended`, `failed`.
- [ ] **[Me/Code]** Keep “Call via Phone (fallback)” only on failure/manual override.
- [ ] **[Me/Code]** Do not display Twilio number in primary UX.

---

## 4) QA / Test Plan

- [ ] **[Both]** Token endpoint works for authenticated users only.
- [ ] **[Both]** In-app call connects and exchanges audio both directions.
- [ ] **[Both]** Transcript + summary persist correctly after call ends.
- [ ] **[Both]** Fallback dialer works when VoIP path fails.
- [ ] **[Both]** Verify behavior on Android + iOS devices.

---

## 5) Release Plan (Phase 1 Beta)

- [ ] **[Me/Code]** Feature flag for in-app VoIP (`VOIP_BETA_ENABLED=true`).
- [ ] **[Both]** Enable for internal testing users first.
- [ ] **[Both]** Monitor failed connect rate + average call duration.
- [ ] **[Both]** Promote to default for all users when stable.

---

## 6) Future: Dedicated Numbers per User/Org

- [ ] **[Me/Code]** Add number provisioning workflow (`user/org -> Twilio number`).
- [ ] **[Me/Code]** Store mapping in database and assign inbound routing rules.
- [ ] **[Both]** Add controls for release/reassign/recycle numbers.
- [ ] **[Both]** Keep in-app VoIP path as primary UX, PSTN number as optional channel.


