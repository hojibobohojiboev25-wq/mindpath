# Quickstart (Vercel + Railway + Neon)

## 1) Database (Neon)

- Create a PostgreSQL database.
- Copy connection URL.

## 2) Backend (Railway)

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:dev
npm run dev
```

Set backend envs:

```env
PORT=3001
HOST=0.0.0.0
CORS_ORIGIN=http://localhost:3000,https://your-vercel-domain.vercel.app
DATABASE_URL=postgresql://...
JWT_SECRET=change-me
OPENAI_API_KEY=
STABILITY_API_KEY=
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me
```

## 3) Frontend (Vercel or local)

```bash
cd frontend
npm install
npm run dev
```

`frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

For Vercel set:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-railway-domain.up.railway.app
```

## 4) Verify

- `GET /api/health` on backend should return `status: ok`.
- Open frontend and create a profile.
- Send chat message from two tabs (websocket + persistence).
- Submit questionnaire and wait for status completion.
- Open `/admin/login` and verify users list loads.
