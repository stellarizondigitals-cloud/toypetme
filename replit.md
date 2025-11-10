# ToyPetMe Virtual Pet Game

## Overview

ToyPetMe is a mobile-first virtual pet game inspired by Tamagotchi and idle games, where users care for virtual pets through activities like feeding, playing, cleaning, and rest. The game features a stat-based progression system, mini-games, rewards, and social elements, delivered as a full-stack web application optimized for mobile devices. Users must create an account to save and protect their pet's progress. The project aims to provide a delightful, stress-free experience, offering a curated collection of 20 unique virtual pets, each with distinct personalities and evolution paths.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Routing:** Wouter
- **UI Components:** Radix UI primitives with shadcn/ui (New York style)
- **Styling:** Tailwind CSS with custom design system
- **State Management:** TanStack Query (React Query)
- **Forms:** React Hook Form with Zod validation

**Design System:**
- Custom color palette (soft pastels)
- Typography: Outfit (headings/game UI), Inter (body text)
- Mobile-first responsive design (max-w-2xl constraints)
- Custom elevation system for interactive feedback
- Theming via CSS custom properties supporting light mode

**Component Architecture:**
- Atomic design approach with reusable UI primitives
- Game-specific, marketplace, navigation, and authentication components
- Protected route wrapper

**Key Features:**
- **Authentication:** Email/password and Google OAuth, email verification, password reset, account linking.
- **Protected Routes:** All game pages require authentication.
- **User Profile:** Display user details and game stats.
- **Virtual Pet Care:** Interactions with mood states, stat tracking (hunger, happiness, energy, cleanliness).
- **Action System:** Feed, play, clean, sleep with stat updates.
- **Shop System:** Purchase items with coins and gems.
- **Inventory Management:** View and use items.
- **Mini-games:** Ball Catch with scoring and rewards.
- **Daily Rewards:** Streak tracking.
- **Toast Notifications:** User feedback.
- **Responsive Design:** Mobile and tablet optimized.

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Authentication:** express-session with bcryptjs
- **Development Server:** TSX
- **Build Process:** ESBuild

**Server Structure:**
- Modular route registration
- Request logging middleware
- JSON body parsing
- Vite integration for HMR and SSR
- Session middleware

**Authentication & Security:**
- Session-based authentication (email/password, Google OAuth via Passport.js)
- Password hashing with bcryptjs
- Session regeneration on login/signup to prevent fixation attacks
- Protected API routes via `requireAuth` middleware
- Email and username uniqueness validation
- Account linking for Google OAuth users
- Auto-verification for Google OAuth users

**Storage Layer:**
- Interface-based storage design (`IStorage`)
- Multi-user support with user isolation
- CRUD operations for user management

**API Routes:**
- **Auth:** Signup, login, logout, Google OAuth, verify, resend verification, password reset, `me` endpoint.
- **User:** User profile.
- **Pet:** Feed, play, clean, sleep actions.
- **Shop:** Shop items.
- **Inventory:** View and use items.
- **Rewards:** Daily rewards.
- **Mini-games:** Start and end ball catch game sessions.

**Production Considerations:**
- Designed for PostgreSQL database migration.
- Session store configured for `connect-pg-simple`.
- Static file serving for production.
- Environment-based configuration.

### Notable Architecture Decisions:
- **Monorepo Structure:** Shared schema between client and server via `shared/` directory.
- **Type Safety:** Drizzle-Zod for runtime validation.
- **Session-Based Auth:** Chosen over JWT for web app security.
- **Mobile PWA Ready:** Manifest.json configured.
- **Responsive Images:** Optimized loading via Vite aliases.
- **Accessibility:** Radix UI provides ARIA-compliant components.
- **State Synchronization:** React Query for caching and optimistic updates.
- **Multi-User Architecture:** User isolation for pets, inventories, and progress.

## External Dependencies

**Database:**
- **Planned:** PostgreSQL via Neon serverless (@neondatabase/serverless)
- **ORM:** Drizzle ORM
- **Migrations:** Drizzle Kit
- **Current:** In-memory storage (MemStorage) for development.

**Third-Party Services:**
- **Email:** Resend API (for verification and password reset emails)
- **Google OAuth:** Google API for authentication
- **Fonts:** Google Fonts (Inter, Outfit)
- **Icons:** Lucide React icon library
- **Asset Storage:** Local static assets in `attached_assets` directory.

**Development Tools:**
- **Replit Integration:** Vite plugins (cartographer, dev banner, runtime error overlay)
- **Type Safety:** TypeScript
- **Code Quality:** Strict TypeScript configuration.

**UI Framework Ecosystem:**
- Radix UI primitives
- Class Variance Authority
- Tailwind Merge and CLSX
- Embla Carousel