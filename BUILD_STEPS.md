# LiveQueue — Step-by-step build plan

Build in this order. Each step is testable before moving on.

---

## Step 1: Backend auth ✅
- [x] Add `bcrypt`, `jsonwebtoken`; Prisma client singleton
- [x] `POST /auth/register` (patron: email, password, name)
- [x] `POST /auth/login` (patron: email, password → JWT)
- [x] `POST /auth/login-dj` (DJ: email, password → JWT)
- [x] Auth middleware for protected routes (`requirePatron`, `requireDj`)

**Check:** Register a user, login, get JWT. Same for DJ (need a DJ in DB first — seed or manual).

---

## Step 2: Backend API (venues + requests) ✅
- [x] `GET /venues` — list venues (public)
- [x] `POST /requests` — create request (auth: patron JWT, body: djId, venueId, spotify track info)
- [x] `GET /requests/me` — my requests (auth: patron JWT)
- [x] `GET /requests/dj` — requests for DJ (auth: DJ JWT, optional ?venueId)
- [x] `PATCH /requests/:id` — update status (auth: DJ JWT, body: status, optional playedAt)

**Check:** Create request as patron, list as patron and as DJ, update status as DJ.

---

## Step 3: Socket.io real-time ✅
- [x] Attach Socket.io to Express server
- [x] Emit `request:new` when a request is created (to room `venue:${venueId}`)
- [x] Emit `request:updated` when a request is PATCHed (to `venue:${venueId}` and `user:${userId}`)
- [x] Clients join rooms via `join` event: `{ venueId }` and/or `{ userId }`

**Check:** New/updated requests appear in client without refresh.

---

## Step 4: Frontend auth + patron flows ✅
- [x] Login/register pages (patron)
- [x] Store JWT in localStorage, auth context (useAuth)
- [x] Venue selection page → GET /venues, link to request with venue + DJ
- [x] Request form (song title + artist for MVP) → POST /requests
- [x] My Requests page → GET /requests/me + Socket.io request:updated → refetch

**Check:** Patron can register, login, pick venue, submit request, see status updates.

---

## Step 5: DJ dashboard ✅
- [x] DJ login page (`/dj/login`)
- [x] Dashboard: live list of requests → `GET /requests/dj` + Socket.io (`dj:${djId}` room)
- [x] Accept / decline / mark played → `PATCH /requests/:id`

**Check:** DJ sees new requests in real time and can accept/decline/mark played.

---

## Step 6: Hardening + queue ops ✅
- [x] 30-min per-(patron, venue, DJ) cooldown on `POST /requests` (returns 429 with retry-after)
- [x] Frontend `apiFetch` auto-refreshes the access token on 401 and retries (patron + DJ)
- [x] `Request.position` field with auto-assigned queue order on accept and `POST /requests/reorder`
- [x] DJ dashboard: move-up / move-down buttons on the accepted queue (`queue:reordered` socket event)
- [x] `VenueDJ.isActive`; DJ can go live/offline per venue, edit name/address, and unlink
- [x] Patron `GET /venues` filters to venues with at least one active DJ
- [x] Removed standalone `/demo` page; product surface is now the real flow

**Check:** A patron blocked by cooldown gets a clear 429 message. A DJ can reorder the queue and toggle "Go offline" — patrons stop seeing the venue when no DJ is active.

---

## Optional later
- Spotify search proxy: `GET /spotify/search?q=...` (backend calls Spotify API)
- Drag-and-drop reorder on the DJ queue (current UI uses up/down buttons)
- Backend tests (auth, request creation + cooldown, reorder ownership checks)
- Deploy (e.g. Vercel + Railway/Render)

---

**Current step:** MVP + hardening complete.

---

### Step 4 frontend setup (optional)
- Copy `frontend/.env.example` to `frontend/.env.local` and set `NEXT_PUBLIC_API_URL=http://localhost:3001` if needed.
- From repo root: `npm run dev:frontend` (or `cd frontend && npm run dev`). Open http://localhost:3000.

---

### How to test Step 1 (auth)

1. **Install deps and set env**
   ```bash
   cd backend && npm install
   cp .env.example .env   # then set DATABASE_URL and JWT_SECRET
   npx prisma migrate dev # if not done
   ```

2. **Create a DJ** (so you can test login-dj). In Prisma Studio or seed:
   ```bash
   npx prisma studio
   ```
   Add a row in `DJ` with email, passwordHash (use bcrypt elsewhere or seed), name.

   Or add a quick **DJ register** route later; for now use seed.

3. **Test patron**
   ```bash
   # Register
   curl -X POST http://localhost:3001/auth/register -H "Content-Type: application/json" -d "{\"email\":\"patron@test.com\",\"password\":\"pass123\",\"name\":\"Patron One\"}"
   # Login
   curl -X POST http://localhost:3001/auth/login -H "Content-Type: application/json" -d "{\"email\":\"patron@test.com\",\"password\":\"pass123\"}"
   ```

4. **Test DJ** (after you have a DJ in DB)
   ```bash
   curl -X POST http://localhost:3001/auth/login-dj -H "Content-Type: application/json" -d "{\"email\":\"dj@test.com\",\"password\":\"pass123\"}"
   ```
