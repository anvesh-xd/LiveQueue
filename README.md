# LiveQueue

Real-time song request platform for live music venues.

Patrons submit requests digitally. DJs manage and respond through a live dashboard — with full control over queue order, approvals, and pricing tiers.

## What it does

- Patrons browse the setlist and submit song requests in real time
- DJs see a live queue dashboard with accept/reject/reorder controls
- Tiered pricing model balances patron demand with performer autonomy
- WebSocket-powered updates with no page refresh needed

## Tech stack

`Next.js` `TypeScript` `PostgreSQL` `Socket.io` `Prisma`

## Design decisions

- **DJ-control-first** — performers always have override authority over the queue
- **Marketplace fairness** — pricing mechanics balance incentives across patrons, DJs, and venues
- **Real-time first** — Socket.io chosen over polling for sub-second queue updates

## Status

MVP built to validate real-time queue logic and marketplace incentive constraints.

## Architecture

```
Patron Web App  ── REST API ──►  Backend (Express)  ──►  PostgreSQL
                                       │
                     Socket.io (request:new, request:updated)
                                       │
                                 DJ Dashboard
```

## Installation (local development)

### Prerequisites

- Node.js >= 18
- PostgreSQL
- npm >= 9

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/anvesh-xd/LiveQueue.git
   cd LiveQueue
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install && cd ..
   cd frontend && npm install && cd ..
   ```

3. **Environment variables**

   **Backend** — copy `backend/.env.example` to `backend/.env`:
   ```env
   PORT=3001
   JWT_SECRET=your-secret-key
   DATABASE_URL="postgresql://user:password@localhost:5432/livequeue?schema=public"
   ```

   **Frontend** — copy `frontend/.env.example` to `frontend/.env.local` (optional):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. **Database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   npm run prisma:seed
   ```

5. **Run the app**
   ```bash
   # From repo root — both backend and frontend
   npm run dev
   ```
   - Backend: http://localhost:3001  
   - Frontend: http://localhost:3000  

   Or run separately: `npm run dev:backend` and `npm run dev:frontend`.

### Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start backend + frontend |
| `npm run dev:backend` | Backend only |
| `npm run dev:frontend` | Frontend only |
| `npm run build` | Build both for production |

Backend: `prisma:migrate`, `prisma:studio`, `prisma:seed`.  
See `backend/README.md` and `frontend/README.md` for more.

## Deployment

After you deploy (**Vercel** + **Render** + **Neon**), add your frontend URL to Vercel as **`NEXT_PUBLIC_SITE_URL`** (same value as your site, e.g. `https://your-app.vercel.app`) so social previews resolve correctly.

Run **`npx prisma migrate deploy`** on production when you ship schema changes, then optionally seed initial venues and accounts:

```bash
cd backend
# Windows PowerShell:
$env:DATABASE_URL="<your Neon connection string>"
npm run prisma:seed
```

The seed creates three sample venues — **Evolve**, **VyNX**, and **Hyze** — plus a patron (`patron@test.com` / `patron123`) and a DJ (`dj@test.com` / `dj123`). Rotate or remove these credentials before any real launch.

Free Render tiers may **cold start** after idle time; the first request can take ~30–60 seconds.

## Documentation

- [Product Requirements Document](./PRD.md) — PRD and feature list
- [Build steps](./BUILD_STEPS.md) — Step-by-step build plan

## Third-party services

Song search uses the **Deezer Simple API**. Use of the API is subject to [Deezer's Terms of Use](https://developers.deezer.com/termsofuse). This project is not affiliated with, endorsed by, or sponsored by Deezer. Personal/portfolio use only; not for commercial use.

## License

MIT
