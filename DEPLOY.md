# LiveQueue — Deployment Guide

Deploy in this order: **Database → Backend → Frontend**, then wire the URLs.

---

## Overview

| Part      | Where to deploy | Notes                    |
|-----------|-----------------|--------------------------|
| Database  | Railway or Neon | PostgreSQL               |
| Backend   | Railway or Render | Node + Express, needs DB URL |
| Frontend  | Vercel          | Next.js, needs backend URL   |

---

## Step 1: Database (PostgreSQL)

### Option A: Railway

1. Go to [railway.app](https://railway.app) and sign in (e.g. with GitHub).
2. **New Project** → **Provision PostgreSQL**.
3. Open the PostgreSQL service → **Variables** or **Connect** tab.
4. Copy **`DATABASE_URL`** (or construct it from host, user, password, port). You’ll use it in the backend.

### Option B: Neon (free Postgres)

1. Go to [neon.tech](https://neon.tech) and create a project.
2. Copy the **connection string** (e.g. `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`). This is your `DATABASE_URL`.

---

## Step 2: Backend (Railway or Render)

### Option A: Railway

1. In the same project (or new one), click **New** → **GitHub Repo** → select **anvesh-xd/LiveQueue**.
2. Railway may detect the repo. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
3. **Variables** (in the backend service):
   - `DATABASE_URL` = (from Step 1)
   - `JWT_SECRET` = (long random string, e.g. from [randomkeygen](https://randomkeygen.com))
   - `FRONTEND_URL` = leave empty for now; set after Step 3 to your Vercel URL, e.g. `https://livequeue.vercel.app`
4. **Deploy.** When it’s live, open the service → **Settings** → **Networking** → **Generate Domain**. Copy the URL (e.g. `https://livequeue-backend.up.railway.app`). This is your **backend URL**.

### Option B: Render

1. Go to [render.com](https://render.com) → **New** → **Web Service**.
2. Connect **anvesh-xd/LiveQueue**.
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance type:** Free (or paid if you prefer).
4. **Environment**:
   - `DATABASE_URL` = (from Step 1)
   - `JWT_SECRET` = (long random string)
   - `FRONTEND_URL` = set after Step 3 (your Vercel URL)
5. Deploy. Copy the service URL (e.g. `https://livequeue-backend.onrender.com`) — this is your **backend URL**.

### Run migrations on the hosted DB

Backend needs the Prisma schema applied once. Options:

- **Railway:** In the backend service, run a one-off command (if available), or use **Settings** → run:  
  `npx prisma migrate deploy`  
  (You can also run this locally with `DATABASE_URL` set to the hosted DB.)
- **Render:** Same idea — run `npx prisma migrate deploy` against the production `DATABASE_URL` (e.g. from your machine:  
  `cd backend && set DATABASE_URL=<your-production-url> && npx prisma migrate deploy`  
  or use Render’s shell if it has one.)

Optional: seed data:  
`cd backend && DATABASE_URL="<prod-url>" npm run prisma:seed`

---

## Step 3: Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. **Add New** → **Project** → import **anvesh-xd/LiveQueue**.
3. **Configure:**
   - **Root Directory:** click **Edit** → set to **`frontend`**.
   - **Framework Preset:** Next.js (auto).
   - **Environment Variable:**
     - Name: `NEXT_PUBLIC_API_URL`
     - Value: your **backend URL** from Step 2 (e.g. `https://livequeue-backend.up.railway.app`).  
     No trailing slash.
4. **Deploy.** When finished, copy the Vercel URL (e.g. `https://livequeue.vercel.app`). This is your **frontend URL**.

---

## Step 4: Wire backend to frontend (CORS + Socket)

1. In **Railway** or **Render**, open your **backend** service.
2. Add or update:
   - `FRONTEND_URL` = your **Vercel frontend URL** (e.g. `https://livequeue.vercel.app`).
3. Redeploy the backend so it allows that origin for CORS and Socket.io.

---

## Step 5: Test the live app

1. Open the **frontend URL** (Vercel).
2. Sign up or log in, open Venues, submit a request, open My Requests.
3. Log in as DJ (DJ dashboard login) and accept/decline/mark played.  
4. Confirm real-time updates work (patron and DJ).

---

## Troubleshooting

- **“Failed to fetch” or CORS errors**  
  - Backend has `FRONTEND_URL` set to the exact Vercel URL (no trailing slash).  
  - Backend was redeployed after setting `FRONTEND_URL`.

- **Socket.io not connecting**  
  - Frontend uses `NEXT_PUBLIC_API_URL` with the same backend URL (https).  
  - Backend allows that origin in Socket.io CORS.

- **Database errors**  
  - `DATABASE_URL` is correct and migrations were run: `npx prisma migrate deploy` against the production DB.

- **Prisma “client did not initialize”**  
  - Backend build includes `prisma generate` (we added this via `build` and `postinstall` in `backend/package.json`).

---

## Quick reference

| Env var (backend)   | Where it comes from        |
|---------------------|----------------------------|
| `DATABASE_URL`      | Railway Postgres or Neon   |
| `JWT_SECRET`        | You (long random string)  |
| `FRONTEND_URL`      | Your Vercel URL            |

| Env var (frontend)  | Where it comes from        |
|---------------------|----------------------------|
| `NEXT_PUBLIC_API_URL` | Your backend URL (Railway/Render) |

After deployment, add **Live: https://your-vercel-url.vercel.app** to your README.
