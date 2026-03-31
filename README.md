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
