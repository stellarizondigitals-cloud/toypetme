# ToyPetMe Virtual Pet Game

## Overview
ToyPetMe is a mobile-first virtual pet game inspired by Tamagotchi and idle games, delivered as a full-stack web application. Users care for virtual pets through activities like feeding, playing, cleaning, and rest, progressing through a stat-based system, mini-games, and rewards. The game aims to provide a delightful, stress-free experience with 20 unique virtual pets, each having distinct personalities and evolution paths. Account creation is required to save pet progress. The project focuses on a comprehensive currency system, stat decay mechanics, and a multi-pet management system.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
**Technology Stack:** React 18 with TypeScript, Vite, Wouter, Radix UI primitives with shadcn/ui, Tailwind CSS, TanStack Query, React Hook Form with Zod validation.
**Design System:** Custom color palette (soft pastels), Outfit and Inter typography, mobile-first responsive design (max-w-2xl constraints), custom elevation system, and light mode theming.
**Component Architecture:** Atomic design, reusable UI primitives, game-specific, marketplace, navigation, and authentication components, protected route wrapper.
**Key Features:** Email/password and Google OAuth, email verification, password reset, protected routes, user profiles, virtual pet care with stat tracking (hunger, happiness, energy, cleanliness, health, age), action system (feed, play, clean, sleep with cooldowns, coin costs, and animated feedback), shop and inventory management, mini-games, daily rewards, toast notifications, and responsive design.

### Backend Architecture
**Technology Stack:** Node.js with TypeScript, Express.js, express-session with bcryptjs, TSX, ESBuild.
**Server Structure:** Modular route registration, request logging, JSON body parsing, Vite integration for HMR and SSR, session middleware.
**Authentication & Security:** Session-based (email/password, Google OAuth via Passport.js) with bcryptjs for password hashing, session regeneration, protected API routes, JWT tokens for mobile/API access (15-min access, 7-day refresh), email/username uniqueness, account linking, auto-verification for Google OAuth.
**Storage Layer:** Interface-based design (`IStorage`) with multi-user support and CRUD operations for user and pet management, including comprehensive stat decay logic and atomic action execution.
**API Routes:**
- **Auth:** Signup, login, logout, Google OAuth, verify, resend verification, password reset, `me` endpoint, JWT token issuance and refresh.
- **User:** User profile.
- **Pet:** Creation, viewing all pets, feed, play, clean, sleep actions.
- **Shop:** Shop items, purchase.
- **Inventory:** View, use items.
- **Rewards:** Daily rewards.
- **Mini-games:** Ball catch sessions.
**Production Considerations:** Designed for PostgreSQL, `connect-pg-simple` for session store, static file serving, environment-based configuration.

### Notable Architecture Decisions
- **Monorepo Structure:** Shared schema (`shared/` directory) for client-server type safety.
- **Type Safety:** Drizzle-Zod for runtime validation.
- **Authentication:** Session-based for web, JWT for mobile/API.
- **Mobile PWA Ready:** `manifest.json` configured.
- **Responsive Images:** Optimized loading.
- **Accessibility:** Radix UI for ARIA-compliant components.
- **State Synchronization:** React Query for caching and optimistic updates.
- **Multi-User Architecture:** User isolation for pets, inventories, and progress.
- **Economic Model:** Actions earn USD, daily login bonus, MAX_COINS cap (5,000), 5-minute cooldowns on core actions, shop system with 9 items and atomic transactions.
- **Stat Decay:** Per-stat decay timestamps for hunger, happiness, cleanliness, and health (only when other stats are at 0), `isSick` flag.

## External Dependencies

**Database:**
- **Planned:** PostgreSQL via Neon serverless (@neondatabase/serverless)
- **ORM:** Drizzle ORM
- **Migrations:** Drizzle Kit
- **Current:** In-memory storage (MemStorage) for development.

**Third-Party Services:**
- **Email:** Resend API (verification, password reset)
- **Google OAuth:** Google API for authentication
- **Fonts:** Google Fonts (Inter, Outfit)
- **Icons:** Lucide React icon library
- **Asset Storage:** Local static assets in `attached_assets`.

**Development Tools:**
- **Replit Integration:** Vite plugins (cartographer, dev banner, runtime error overlay)
- **Type Safety:** TypeScript
- **Code Quality:** Strict TypeScript configuration.

**UI Framework Ecosystem:**
- Radix UI primitives
- Class Variance Authority
- Tailwind Merge and CLSX
- Embla Carousel