# MindPath Rebuild

Full rebuild with:

- `frontend/` as Next.js App Router UI
- `backend/` as Fastify + Socket.io API
- PostgreSQL (Neon) with Prisma
- 3 separate AI sections: Analysis, Mind Map, Assistant

## Architecture

- Frontend routes are in `frontend/src/app/*`
- Backend API version is `api/v1`
- WebSocket runs on backend root and shares chat persistence

## Main Sections

- `/chat` - realtime websocket chat with delivery/read statuses
- `/ai-analysis` - questionnaire + async AI processing
- `/ai-mindmap` - mind map load/edit/revision endpoint
- `/ai-assistant` - dedicated AI assistant threads/messages
- `/admin` and `/admin/login` - JWT-protected admin dashboard

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=3001
HOST=0.0.0.0
CORS_ORIGIN=http://localhost:3000,https://your-vercel-domain.vercel.app
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
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

### Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## API v1 Endpoints

- `GET /api/v1/health`
- `GET /api/v1/chat/history`
- `POST /api/v1/chat/join`
- `POST /api/v1/chat/messages`
- `POST /api/v1/chat/receipts/delivered`
- `POST /api/v1/chat/receipts/read`
- `GET /api/v1/questionnaire/questions`
- `POST /api/v1/questionnaire/submit`
- `GET /api/v1/questionnaire/status/:submissionId`
- `GET /api/v1/results/latest?profileId=<id>`
- `PATCH /api/v1/mind-map/:analysisResultId`
- `POST /api/v1/assistant/threads`
- `GET /api/v1/assistant/threads?profileId=<id>`
- `GET /api/v1/assistant/messages?threadId=<id>`
- `POST /api/v1/assistant/messages`
- `POST /api/v1/admin/login`
- `POST /api/v1/admin/verify`
- `GET /api/v1/admin/users`

## Tests

- Backend: `cd backend && npm test`
- Frontend build: `cd frontend && npm run build`
