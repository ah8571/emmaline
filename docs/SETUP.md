# Emmaline Mobile MVP Setup

Use this guide to run the mobile app quickly with your DigitalOcean backend.

## 1) Prerequisites

- Node.js 18+
- npm 10+
- Expo Go installed on your phone

## 2) Configure backend URL (DigitalOcean first)

Create `mobile/.env` with:

```env
EXPO_PUBLIC_API_URL=https://emmaline-agtyz.ondigitalocean.app/api
```

If/when you move to custom domain and SSL is healthy, switch to:

```env
EXPO_PUBLIC_API_URL=https://emmaline.app/api
```

If you need local backend debugging instead:

```env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:3000/api
```

## 3) Install and run mobile app

```bash
cd mobile
npm install
npx expo start --tunnel --clear
```

Then scan QR code with Expo Go.

## 4) MVP smoke test

1. Register/login.
2. Tap call button.
3. Confirm backend receives `POST /api/twilio/initiate`.
4. Confirm dialer opens with Twilio number.

## 5) If startup fails

```bash
cd mobile
npx expo install --fix
npx expo start --tunnel --clear --port 8090
```

## 6) Notes for this stage

- Keep backend on DigitalOcean for easy real-phone testing.
- Keep mobile changes local/fast via Expo Go.
- Add app-store packaging (EAS) once this smoke test is stable.
