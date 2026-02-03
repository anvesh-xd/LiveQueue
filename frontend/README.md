# LiveQueue Frontend

Next.js + TypeScript frontend application for LiveQueue.

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **UI Library:** React 18
- **Real-time:** Socket.io Client

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (create `.env.local` file):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Development

Start the development server:
```bash
npm run dev
```

The application will run on `http://localhost:3000`

## Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── public/               # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

## Features

- Server-side rendering with Next.js App Router
- TypeScript for type safety
- Real-time updates with Socket.io
- Responsive design
