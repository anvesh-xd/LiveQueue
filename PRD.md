# LIVEQUEUE
## PRODUCT REQUIREMENTS DOCUMENT + BUILD PROMPTS

---

## PRODUCT REQUIREMENTS DOCUMENT

**Product Name:** LiveQueue  
**Owner:** Anvesh Sapkota  
**Type:** Personal Engineering Project  
**Status:** MVP Definition

---

## 1. SUMMARY

LiveQueue is a real-time web application for live events where patrons submit song requests digitally and DJs manage those requests from a live dashboard. Patrons can see status updates instantly (pending → accepted/declined → played).

---

## 2. GOALS

- Patrons can request songs without interrupting the DJ.
- DJs maintain full control over what gets played.
- Real-time sync between patron and DJ views.
- Deployable demo suitable for portfolio and interviews.

---

## 3. USERS & ROLES

**Patron:**
- Browse venues
- Search songs
- Submit song requests
- Track request status

**DJ:**
- View incoming requests
- Accept or decline requests
- Manage queue
- Mark requests as played

---

## 4. CORE USER FLOWS

### Patron Flow:
1. Sign up / log in
2. Select venue
3. Search songs (Spotify API)
4. Submit request
5. View request status updates in real time

### DJ Flow:
1. Log in
2. Receive incoming requests in real time
3. Accept or decline requests
4. View queue of accepted requests
5. Mark requests as played

---

## 5. MVP FEATURES

### Patron App:
- Authentication
- Venue selection
- Spotify song search
- Request submission
- My Requests page

### DJ Dashboard:
- Authentication
- Live incoming requests
- Accept / decline controls
- Queue view
- Mark played

### System:
- PostgreSQL database
- REST API
- WebSockets real-time updates
- Deployed frontend and backend

---

## 6. OUT OF SCOPE (FOR MVP)

- Real payments / Stripe
- QR or geolocation check-ins
- DJ software integrations
- Advanced analytics
- Native mobile apps

---

## 7. DATA MODEL (MINIMUM)

- **User** (patron)
- **DJ**
- **Venue**
- **VenueDJ** (many-to-many)
- **Request:**
  - `id`
  - `userId`
  - `djId`
  - `venueId`
  - `spotifyTrackId`
  - `songTitle`
  - `artistName`
  - `albumArtUrl`
  - `status` (pending | accepted | declined | played)
  - `createdAt`
  - `updatedAt`
  - `playedAt` (nullable)

---

## 8. API (MINIMUM)

```
POST /auth/register
POST /auth/login
POST /auth/login-dj

GET /venues
GET /spotify/search?q=...

POST /requests
GET /requests/me
GET /requests/dj
PATCH /requests/:id
```

---

## 9. REAL-TIME EVENTS

- `request:new`
- `request:updated`

---

## 10. SUCCESS CRITERIA

- Patron can submit a request end-to-end.
- DJ sees new requests without refreshing.
- Patron sees status updates instantly.
- App is deployed and usable.
