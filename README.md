LIVE REQUEST

A real-time web application that allows patrons at live venues to submit song
requests digitally while DJs manage and respond to those requests through a
live dashboard.

This project explores real-time systems, multi-user workflows, API integrations,
and full-stack application architecture.

FEATURES

Patron Experience
- Sign up and log in
- Select a venue
- Search for songs using the Spotify Web API
- Submit song requests
- View live request status:
  - Pending
  - Accepted
  - Declined
  - Played

DJ Dashboard
- Secure login
- Real-time incoming request feed
- Accept or decline requests
- View and manage the request queue
- Mark songs as played

System
- Real-time updates using WebSockets
- Role-based authentication (Patron / DJ)
- Persistent data storage
- Deployed full-stack application


MOTIVATION
At live venues, DJs are often interrupted by patrons requesting songs verbally,
which disrupts performance flow and creates uncertainty for patrons.
LiveRequest digitizes this interaction while preserving DJ control and improving
transparency for users.

This project was built as a personal engineering project to practice:
- Real-time application design
- API integrations
- System architecture
- Full-stack development

TECH STACK

Frontend
- React / Next.js
- TypeScript
- Tailwind CSS

Backend
- Node.js
- Express (or Next.js API routes)

Database
- PostgreSQL
- Prisma ORM

Real-Time
- Socket.io (WebSockets)

External APIs
- Spotify Web API (song search)

Deployment
- Vercel (frontend)
- Railway / Render / Supabase (backend & database)

ARCHITECTURE OVERVIEW

Patron Web App
      |
      | REST API
      v
Backend Server  -----> PostgreSQL Database
      |
      | WebSockets (real-time updates)
      v
DJ Dashboard


CORE USER FLOWS

Patron Flow
1. Log in
2. Select venue
3. Search for a song
4. Submit request
5. View live status updates

DJ Flow
1. Log in to dashboard
2. View incoming requests
3. Accept or decline requests
4. Manage queue
5. Mark requests as played


INSTALLATION (LOCAL DEVELOPMENT)

Prerequisites
- Node.js
- PostgreSQL
- Spotify Developer API credentials

Setup
1. Clone the repository
2. Install backend dependencies
3. Install frontend dependencies
4. Configure environment variables
5. Start backend server
6. Start frontend server


ENVIRONMENT VARIABLES

Backend
- DATABASE_URL
- SPOTIFY_CLIENT_ID
- SPOTIFY_CLIENT_SECRET
- JWT_SECRET

Frontend
- NEXT_PUBLIC_API_URL


LIVE DEMO

Coming soon.

FUTURE ENHANCEMENTS

- Real payments with Stripe
- Priority queue logic
- Analytics dashboard
- Mobile optimization / PWA
- AI-based song recommendations
- Offline resilience

WHAT THIS PROJECT DEMONSTRATES

- Real-time system architecture
- Multi-role authentication and authorization
- API integration and rate limiting
- Relational database design
- WebSocket event-driven communication
- Production deployment workflows
- Clean engineering practices


MIT LICENSE

MIT
