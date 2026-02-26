# DigitalOcean Multi-Service Deployment Guide

This guide explains how to deploy both the Emmaline backend and website to DigitalOcean App Platform as a single integrated application.

## Architecture

```
emmaline.app (Single Domain)
├── / → Website (Next.js landing page)
└── /api/* → Backend (Node.js API)
```

## Prerequisites

1. DigitalOcean account with App Platform access
2. GitHub repository connected (ah8571/emmaline)
3. All environment variables configured

## Environment Variables Required

You need to set these in DigitalOcean App Settings → Environment Variables:

### Authentication & Security
```
JWT_SECRET=your_long_random_string_64_chars_minimum
```

### Twilio (Phone Service)
```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1 573 749 5321
```

### Supabase (Database)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Google Cloud (STT/TTS)
```
GOOGLE_CLOUD_PROJECT_ID=bold-momentum-487022-h5
```

Note: Google Cloud APIs use Application Default Credentials. For production, configure:
- Workload Identity (recommended)
- Or environment variable with credentials JSON

### OpenAI (AI Responses)
```
OPENAI_API_KEY=sk-proj-...
```

## Deployment Steps

### Option 1: Using app.yaml (Recommended)

1. **Push app.yaml to GitHub:**
   ```bash
   git add app.yaml
   git commit -m "Add DigitalOcean app configuration"
   git push
   ```

2. **In DigitalOcean Dashboard:**
   - Go to **Apps** → **Create App**
   - Choose **GitHub** source
   - Select `ah8571/emmaline` repository
   - Branch: `main`
   - Select **app.yaml** option
   - Add all environment variables (see above)
   - Click **Create**

3. **DigitalOcean will automatically:**
   - Build both services
   - Deploy them together
   - Route traffic correctly
   - Provide HTTPS certificate

### Option 2: Manual Configuration

1. **Create new App** → Choose GitHub source
2. **Add two services:**

#### Backend Service
- Name: `backend`
- Source: `/backend`
- Build: `npm install`
- Run: `npm start`
- Port: `3000`
- Route path: `/api`

#### Website Service
- Name: `website`
- Source: `/website`
- Build: `npm install && npm run build`
- Run: `npm start`
- Port: `3000`
- Route path: `/`

3. **Add environment variables** for both services
4. **Deploy**

## How Traffic Routing Works

DigitalOcean automatically routes requests based on path:

```
https://emmaline.app/
  ↓
Website Service (Next.js)
Shows landing page

https://emmaline.app/api/calls
  ↓
Backend Service (Node.js)
API endpoint for calls

https://emmaline.app/ws/media-stream
  ↓
Backend Service (Node.js)
WebSocket for media streaming
```

## Important Configuration Notes

### Port Binding
Both services run on port 3000 internally, but DigitalOcean handles port mapping automatically.

### CORS
Backend is configured to allow requests from `https://emmaline.app`

### WebSocket
WebSocket endpoint available at `wss://emmaline.app/ws/media-stream`

### Health Checks
- Backend: `GET /health` → Returns 200 OK
- Website: `GET /` → Returns HTML

## Troubleshooting

### Service won't start
1. Check logs in DigitalOcean dashboard
2. Verify environment variables are set
3. Check that build commands succeed locally: `npm install && npm start`

### API calls failing from website
1. Ensure `BACKEND_URL` is set in website environment
2. Check CORS configuration in backend
3. Verify `/api` route path is configured

### WebSocket not connecting
1. Check `WEBSOCKET_URL` in backend env
2. Ensure Twilio webhook points to: `https://emmaline.app/api/calls/incoming`
3. Verify WebSocket route is enabled

### Database connection errors
1. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
2. Check Supabase project is active
3. Verify IP whitelist in Supabase settings

## Auto-Deployment

With this setup, every push to `main` branch automatically:
1. Triggers GitHub webhook
2. DigitalOcean detects changes
3. Rebuilds and redeploys both services
4. Zero-downtime deployment
5. Automatic rollback if build fails

## Custom Domain

To use your own domain (emmaline.app):

1. Go to App Settings → Domains
2. Add custom domain
3. Update DNS records to point to DigitalOcean
4. HTTPS certificate auto-provisioned

## Monitoring

Access logs and metrics in DigitalOcean:
- App logs: **Apps** → **Your App** → **Logs**
- Metrics: **Apps** → **Your App** → **Metrics**
- Deploy history: **Apps** → **Your App** → **Deployments**

## Cost Estimation

- Starter: $6-12/month (good for MVP)
- Standard: $12-20/month (better performance)
- Professional: $20+/month (high traffic)

Pricing includes:
- Compute for both services
- Automatic HTTPS
- Managed database connectivity
- Built-in monitoring

See [DigitalOcean App Platform pricing](https://www.digitalocean.com/pricing/app-platform) for details.

## Next Steps

1. Commit `app.yaml` to GitHub
2. Set environment variables in DigitalOcean
3. Deploy app
4. Test endpoints:
   - `https://emmaline.app/` (landing page)
   - `https://emmaline.app/api/health` (backend health check)
5. Configure Twilio webhook to `https://emmaline.app/api/calls/incoming`
6. Test incoming phone call
