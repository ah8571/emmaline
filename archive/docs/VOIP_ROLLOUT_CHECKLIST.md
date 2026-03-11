# In-App VoIP Rollout Checklist (Phase 1 Beta)

Goal: make in-app calling the primary UX, keep dialer as fallback, and hide the underlying phone number from end users.

---

## 0) Ownership Legend

- **[You/Twilio Console]**: best done in Twilio dashboard.
- **[Me/Code]**: backend/mobile implementation in repo.
- **[Both]**: coordinated verification.

---

## 1) Twilio Console Setup (Required)

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

---

## 7) Future: 

- [ ] **[Me/Code]** Keep the current per-call usage ledger for measured units and vendor-reported values.
- [ ] **[Me/Code]** Persist exact OpenAI token usage per request and map it into per-call credit events.
- [ ] **[Me/Code]** Use Twilio call fetch/status data to capture vendor-reported call price when available.
- [ ] **[Me/Code]** Keep measured Google STT minutes and TTS characters per call as the immediate source of truth for Google usage.
- [ ] **[Both]** Decide the product credit model: raw vendor pass-through, tiered markup, or bundled monthly credits.
- [ ] **[Me/Code]** Add a dedicated `credit_ledger` or `usage_events` table so credits are append-only and auditable.
- [ ] **[Me/Code]** Add nightly reconciliation jobs for provider usage vs stored ledger values.
- [ ] **[Me/Code]** For true Google invoice-grade accuracy at scale, evaluate Cloud Billing export to BigQuery and map billing rows back to service/SKU/time window.
- [ ] **[Both]** Add admin reporting for cost per call, average cost per active user, and margin by pricing tier.


