# LiveQueue

Real-time web application for live events where patrons submit song requests digitally and DJs manage those requests from a live dashboard.

## 🎯 Overview

LiveQueue enables seamless communication between event patrons and DJs. Patrons can browse venues, search for songs via Spotify, and submit requests. DJs receive these requests in real-time and can accept, decline, or mark them as played.

## 🏗️ Architecture

This is a monorepo containing:

- **Backend** (`/backend`) - Express + TypeScript API server
- **Frontend** (`/frontend`) - Next.js + TypeScript web application

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL + Prisma
- Socket.io (real-time)

### Frontend
- Next.js 14
- TypeScript
- React 18
- Socket.io Client

## 📦 Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd LiveQueue
```

2. Install all dependencies:
```bash
npm install
```

3. Set up environment variables:

**Backend** (`backend/.env`):
```env
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/livequeue"
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Set up the database:
```bash
cd backend
npx prisma migrate dev
```

## 🚀 Development

### Run both frontend and backend:
```bash
npm run dev
```

### Run individually:
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

- Backend: http://localhost:3001
- Frontend: http://localhost:3000

## 📝 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:backend` - Start backend only
- `npm run dev:frontend` - Start frontend only
- `npm run build` - Build both projects for production
- `npm run build:backend` - Build backend only
- `npm run build:frontend` - Build frontend only

### Backend (`/backend`)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run type-check` - Type check without building

### Frontend (`/frontend`)
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check without building

## 📁 Project Structure

```
LiveQueue/
├── backend/
│   ├── src/
│   │   └── index.ts
│   ├── prisma/
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── package.json
├── PRD.md
└── README.md
```

## 🧪 Testing

Testing setup will be added in future iterations.

## 📄 Documentation

- [Product Requirements Document](./PRD.md) - Complete PRD with features and specifications

## 🤝 Contributing

This is a personal engineering project. Contributions and suggestions are welcome!

## 📝 License

ISC
