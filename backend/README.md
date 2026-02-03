# LiveQueue Backend

Express + TypeScript backend server for LiveQueue application.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma
- **Real-time:** Socket.io

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (create `.env` file):
```env
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/livequeue"
```

3. Copy the example environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials.

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. (Optional) Seed the database:
```bash
npm run prisma:seed
```

## Development

Start the development server with hot reload:
```bash
npm run dev
```

The server will run on `http://localhost:3001`

## Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Database Management

### Prisma Scripts

- `npm run prisma:migrate` - Create and apply database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed the database with initial data

## API Endpoints

### Health Check
- `GET /health` - Returns server status

## Project Structure

```
backend/
├── src/
│   └── index.ts          # Main server file
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seed file
├── package.json
├── tsconfig.json
├── .env.example          # Example environment variables
└── README.md
```
