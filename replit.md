# AnimeBite - Anime Streaming Platform

## Overview
AnimeBite is a modern anime streaming platform built with React, Express, and TypeScript. The platform features a dark theme with vibrant anime artwork, providing users with a seamless viewing experience for browsing and watching anime content.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (via Drizzle ORM)
- **UI Components**: Radix UI, Tailwind CSS
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Video Player**: Video.js with HLS support
- **Authentication**: Firebase Auth (configured)

## Project Structure
```
├── client/              # Frontend React application
│   ├── public/         # Static assets
│   └── src/
│       ├── components/ # Reusable UI components
│       ├── contexts/   # React contexts (Auth, Language)
│       ├── hooks/      # Custom React hooks
│       ├── lib/        # Utilities and configurations
│       └── pages/      # Page components
├── server/             # Express backend
│   ├── index.ts       # Server entry point
│   ├── routes.ts      # API routes
│   ├── storage.ts     # Storage utilities
│   └── vite.ts        # Vite integration
├── shared/            # Shared TypeScript types and schemas
└── migrations/        # Database migrations
```

## Features
- 🎬 Browse trending, latest, and top-rated anime
- 🔍 Advanced search with filters
- 📺 Video streaming with quality selection
- 👤 User authentication (Firebase)
- 📱 Responsive design for all devices
- 🌙 Dark theme optimized for viewing
- 📋 Watchlist and profile management
- 💬 Community forums (in development)

## Development Setup
The application runs on port 5000 and serves both the API and frontend through a single Express server. In development mode, Vite is integrated with the Express server for hot module reloading.

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (development/production)

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

## API Integration
The backend proxies requests to the AnimeBite API (https://animebite.onrender.com) and handles:
- Image proxying for CORS
- Video stream proxying with HLS support
- M3U8 playlist rewriting
- Subtitle track proxying

## Design Philosophy
AnimeBite follows a reference-based design approach inspired by modern streaming platforms like Crunchyroll and 9anime. The design emphasizes:
- Dark backgrounds with purple/magenta accents
- High-quality anime artwork as the visual centerpiece
- Consistent spacing and typography
- Smooth animations and transitions
- Accessibility with keyboard navigation and ARIA labels

## Recent Changes
- 2024-11-21: Initial project setup in Replit environment
  - Created missing page components (anime-detail, azlist, signup, reset-password, profile, tv-series, not-found)
  - Configured workflow for development server on port 5000
  - Set up deployment configuration for autoscale
  - Added .gitignore for Node.js projects

## User Preferences
- Dark theme is enforced for optimal viewing experience
- All hosts are allowed in Vite config for Replit proxy compatibility

## Notes
- Database provisioning requires manual setup via Replit Database tool
- Firebase configuration is already included but may need API key rotation
- The app fetches anime data from an external API service
