# EMOM Pulse - Fitness Workout Timer Application

## Overview

EMOM Pulse is a cross-platform fitness application designed to generate personalized EMOM (Every Minute On the Minute) workouts and provide an interactive timer experience. The application features:

- **Personalized workout generation** based on fitness level, available equipment, and training goals
- **Adaptive difficulty** that adjusts based on your perceived exertion after each workout
- **EMOM timer** with vibration alerts and exercise previews
- **Progress tracking** with workout history and skill score progression

The app uses a "High Voltage" design aesthetic with deep black backgrounds and neon lime (#ccff00) accents.

## Current Architecture

### Dual Frontend Approach

The application has two frontend implementations:

1. **React Web Client** (`client/` directory) - Currently active
   - Served via Express/Vite
   - Uses Replit Auth (session cookies)
   - Full functionality available

2. **Expo React Native** (`app/` directory) - Ready for mobile deployment
   - expo-router for navigation
   - Bottom tabs: Home, Workout, Profile
   - Designed for iOS/Android app stores

### Running the App

**Current (Web)**: `npm run dev` starts the Express server with Vite, serving the React web app at port 5000.

**Future (Mobile)**: For native mobile builds, the backend would need to be deployed separately, and the Expo app configured to connect to that backend URL.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Client Architecture

**Dual Frontend Approach**

The application maintains two separate frontend implementations:

1. **Web Client** (`client/` directory)
   - Built with React, Vite, and Tailwind CSS
   - Uses Wouter for routing
   - Radix UI components with shadcn/ui styling system
   - Responsive mobile-first design with desktop support
   - Session-based authentication via cookies

2. **Native Mobile Client** (`app/` directory)
   - Built with Expo and React Native
   - Expo Router for file-based navigation
   - Tab-based navigation structure
   - Native components styled to match web aesthetic
   - Shares authentication flow with web client

**Rationale**: This dual-frontend approach allows the application to provide both a Progressive Web App experience and native mobile capabilities. The web client prioritizes rapid iteration and deployment, while the native client enables better mobile performance and potential for platform-specific features (notifications, offline support).

**State Management**

- TanStack Query (React Query) for server state management
- Local React state for UI interactions
- Shared query keys ensure consistent data fetching patterns

**Design System**

- Dark theme with neon accent colors (#ccff00 "Neon Lime")
- Custom fonts: Teko (display), Manrope (body)
- Component library based on Radix UI primitives
- Shared color palette defined in both web and mobile configs

### Backend Architecture

**Server Framework**

- Express.js with TypeScript
- RESTful API design
- Session-based authentication using express-session
- PostgreSQL session storage for persistence

**API Structure**

The API is organized into three main domains:

1. **Authentication Routes** (`/api/auth/*`)
   - Replit OAuth integration for user authentication
   - Session management and user profile retrieval
   - Account deletion functionality

2. **Profile Routes** (`/api/profile`)
   - User fitness profile CRUD operations
   - Stores preferences: fitness level, equipment, goal focus, skill score

3. **Workout Routes** (`/api/workout/*`)
   - Workout generation endpoint
   - Session tracking and history
   - Perceived exertion feedback collection

**Rationale**: RESTful design provides clear separation of concerns and makes the API easy to understand and consume from multiple clients. Session-based auth simplifies mobile integration compared to JWT-based approaches.

### Data Layer

**Database Schema**

The application uses PostgreSQL with Drizzle ORM. Key tables:

1. **sessions** - Express session storage (required for Replit Auth)
2. **users** - Core user account data from OAuth provider
3. **profiles** - Fitness preferences and skill tracking
4. **workoutSessions** - Completed workout records
5. **workoutRounds** - Individual exercise rounds within sessions

**Relationships**:
- Users → Profiles (one-to-one)
- Profiles → WorkoutSessions (one-to-many)
- WorkoutSessions → WorkoutRounds (one-to-many)

**Rationale**: Normalized schema allows for detailed workout tracking while keeping user preferences separate. The skill score in profiles enables adaptive difficulty adjustment.

### Workout Generation Algorithm

**Rule-Based Generation System**

Located in `server/utils/emomGenerator.ts`, the workout generator uses a deterministic algorithm rather than AI:

1. Filters exercises by available equipment
2. Selects exercises matching user's goal focus (cardio, strength, metcon)
3. Adjusts rep counts based on fitness level and skill score
4. Ensures balanced muscle group distribution
5. Varies workout duration based on skill level

**Adaptive Difficulty**

- Skill score (0-100) adjusts after each workout based on perceived exertion
- Score increases if workout was too easy, decreases if too hard
- Future workouts automatically adjust difficulty based on current score

**Rationale**: Rule-based generation provides predictable, safe workouts without external API dependencies or costs. The adaptive system learns user capacity over time without complex ML models.

### Build and Deployment

**Development Workflow**

- Web client: Vite dev server with HMR
- Mobile: Expo development server
- Backend: tsx for TypeScript execution with hot reload
- Concurrent development of all three components

**Production Build**

- Custom build script (`script/build.ts`) using esbuild
- Web client compiled with Vite to `dist/public`
- Server bundled to `dist/index.cjs` with selective dependencies
- Optimized for cold start performance by bundling frequently-used packages

**Rationale**: The custom build process reduces deployment size and improves cold start times on serverless platforms by bundling select dependencies while externalizing stable ones.

## External Dependencies

### Authentication Service

- **Replit Auth** (OpenID Connect)
- Provides OAuth-based user authentication
- Session management handled via `connect-pg-simple`
- User profile data synced to local database

### Database

- **Neon PostgreSQL** (serverless Postgres)
- Connection pooling via `@neondatabase/serverless`
- WebSocket support for serverless environments
- Drizzle ORM for type-safe queries

### UI Component Libraries

- **Radix UI** - Headless, accessible component primitives
- **Tailwind CSS** - Utility-first styling framework
- **shadcn/ui** - Pre-built component patterns
- **Lucide Icons** - Icon set for consistent iconography

### Mobile Framework

- **Expo** - React Native development platform
- **Expo Router** - File-based navigation for mobile
- Target platforms: iOS and Android

### Development Tools

- **Vite** - Fast build tool and dev server for web
- **esbuild** - Fast JavaScript bundler for production
- **TypeScript** - Type safety across all codebases
- **Drizzle Kit** - Database migration management

### Hosting Considerations

The application is designed for deployment on Replit, with:
- Environment-based configuration
- Replit-specific Vite plugins for development experience
- Meta image plugin for OpenGraph optimization
- Session storage in PostgreSQL for multi-instance support