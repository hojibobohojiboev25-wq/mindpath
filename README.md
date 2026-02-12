# MindPath

Production-ready architecture for personality analysis and realtime chat.

## Architecture

- Frontend: `frontend/` (Next.js) on Vercel
- Backend: `backend/` (Fastify + Socket.io) on Railway
- Database: PostgreSQL (Neon) via Prisma ORM

## Features

- Realtime global chat with WebSocket + REST fallback
- Message persistence with delivery/read receipts
- Questionnaire submission with async AI processing pipeline
- Stored analysis results and mind map revisions
- Admin authentication (JWT + bcrypt) and users analytics endpoint
- Rate limits, CORS allowlist, origin checks for state-changing requests

## Project Structure

- `frontend/pages/*` - UI routes
- `frontend/services/api/*` - unified API client layer
- `frontend/services/socket/*` - WebSocket client
- `backend/src/routes/*` - REST endpoints
- `backend/src/services/*` - domain logic
- `backend/src/websocket.js` - Socket.io gateway
- `backend/prisma/schema.prisma` - DB schema

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=3001
HOST=0.0.0.0
CORS_ORIGIN=http://localhost:3000,https://mindpath-amber.vercel.app
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mindpath?schema=public
JWT_SECRET=change-me
OPENAI_API_KEY=
STABILITY_API_KEY=
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## Local Run

### 1) Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:dev
npm run dev
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy

### Backend (Railway)

1. Create Railway service from `backend/`.
2. Add environment variables from section above.
3. Run `npm run prisma:migrate` on deploy.

### Database (Neon)

1. Create PostgreSQL database.
2. Copy connection string to `DATABASE_URL`.

### Frontend (Vercel)

1. Set Root Directory to `frontend`.
2. Add `NEXT_PUBLIC_API_BASE_URL=https://<your-railway-backend-domain>`.
3. Deploy.

## API Endpoints

- `GET /api/health`
- `GET /api/chat/history`
- `POST /api/chat/join`
- `POST /api/chat/messages`
- `POST /api/chat/receipts/delivered`
- `POST /api/chat/receipts/read`
- `GET /api/questionnaire/questions`
- `POST /api/questionnaire/submit`
- `GET /api/questionnaire/status/:submissionId`
- `GET /api/results/latest?profileId=<id>`
- `PATCH /api/mind-map/:analysisResultId`
- `POST /api/admin/login`
- `POST /api/admin/verify`
- `GET /api/admin/users`

## Testing & CI

- Backend test: `cd backend && npm test`
- Frontend build check: `cd frontend && npm run build`
- CI workflow: `.github/workflows/ci.yml` (backend tests + frontend build)
