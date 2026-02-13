# Quickstart (Vercel + Railway + Neon)

## 1) Neon PostgreSQL

- Create a Neon DB and copy connection string.
- Put it into backend `DATABASE_URL`.

## 2) Backend on Railway

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:dev
npm run dev
```

Required backend envs:

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

## 3) Frontend on Vercel

```bash
cd frontend
npm install
npm run dev
```

Frontend env:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

For Vercel:

```env
NEXT_PUBLIC_API_BASE_URL=https://<railway-backend-domain>
```

## 4) Smoke Test

- `GET /api/v1/health` returns `success: true`
- Create profile from `/`
- Send messages in `/chat`
- Submit in `/ai-analysis` and wait completion
- Open `/ai-mindmap` and save revision
- Open `/ai-assistant` and send assistant message
- Login at `/admin/login` and verify users table on `/admin`
