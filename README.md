# LiveQueue

A real-time web application that allows patrons at live venues to submit song requests digitally while DJs manage and respond to those requests through a live dashboard.

This project explores real-time systems, multi-user workflows, API integrations, and full-stack application architecture.

## Features

**Patron experience**
- Sign up and log in
- Select a venue
- Request songs via Spotify search or manual entry
- View live request status: Pending → Accepted / Declined → Played

**DJ dashboard**
- Secure login
- Real-time incoming request feed
- Accept or decline requests
- View and manage the request queue
- Mark songs as played

**System**
- Real-time updates using Socket.io (WebSockets)
- Role-based authentication (Patron / DJ)
- PostgreSQL + Prisma
- Monorepo: Next.js frontend, Express backend

## Motivation

At live venues, DJs are often interrupted by patrons requesting songs verbally, which disrupts performance flow and creates uncertainty for patrons. LiveQueue digitizes this interaction while preserving DJ control and improving transparency for users.

This project was built as a personal engineering project to practice real-time application design, API integrations, system architecture, and full-stack development.

## Tech stack

| Layer     | Tech |
|----------|------|
| Frontend | Next.js 14, React 18, TypeScript |
| Backend  | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Real-time | Socket.io |
| Song search | [Spotify Web API](https://developer.spotify.com/documentation/web-api) (optional) |

## Architecture

Monorepo layout:

- **Backend** (`/backend`) — Express API, auth, venues, requests CRUD, Socket.io
- **Frontend** (`/frontend`) — Next.js app, patron flows, DJ dashboard

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

## Live demo

Coming soon.

## Documentation

- [Product Requirements Document](./PRD.md) — PRD and feature list
- [Build steps](./BUILD_STEPS.md) — Step-by-step build plan

## Third-party services

Song search uses the **Spotify Web API**. Use of the API is subject to [Spotify’s Developer Terms of Service](https://developer.spotify.com/terms). This project is not affiliated with, endorsed by, or sponsored by Spotify. Personal/portfolio use only; not for commercial use.

## License

MIT
