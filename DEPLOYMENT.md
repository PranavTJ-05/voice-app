# Deployment layout for Tara

This app is not a single deployable app. It must be deployed as separate services:

- Frontend: Next.js app for the website and UI
- API: FastAPI service for `/chat`, `/token`, `/config`, `/health`
- Voice worker: LiveKit agent that listens and speaks in the voice room

## Production deployment

### 1) Frontend
Deploy the repo root to Vercel or any Node host.

Environment:

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

Build and start:

```bash
npm install
npm run build
npm run start
```

### 2) API
Deploy the backend from `tara/backend`.

```bash
cd tara/backend
uv sync
uv run uvicorn app.api:app --host 0.0.0.0 --port 8000
```

Environment:

```bash
GROQ_API_KEY=...
LIVEKIT_URL=wss://your-livekit-project.livekit.cloud
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### 3) Voice worker
Keep this service always running.

```bash
cd tara/backend
uv run python -m app.agent dev
```

This worker handles real-time audio sessions with LiveKit.

## Why this structure is required

- The browser microphone only works under HTTPS.
- The API must be reachable from the frontend.
- The voice worker must keep a LiveKit session alive.
- LiveKit needs separate credentials and a separate runtime.

## Recommended hosting stack

- Frontend: Vercel
- API: Railway or Render
- Voice worker: Railway, VPS, or Fly.io
- Realtime: LiveKit Cloud

## Notes

- Never deploy only the root Next app and expect voice to work by itself.
- The backend and voice worker are required runtime components.
