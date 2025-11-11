# ToyPetMe Virtual Pet Game

## Overview

ToyPetMe is a mobile-first virtual pet game inspired by Tamagotchi and idle games, where users care for virtual pets through activities like feeding, playing, cleaning, and rest. The game features a stat-based progression system, mini-games, rewards, and social elements, delivered as a full-stack web application optimized for mobile devices. Users must create an account to save and protect their pet's progress. The project aims to provide a delightful, stress-free experience, offering a curated collection of 20 unique virtual pets, each with distinct personalities and evolution paths.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates

**November 11, 2025 - Pet Action Cooldowns, Coin Costs, and Animated Feedback**
- Implemented comprehensive action system with cooldowns, coin costs, and visual feedback
- Backend enhancements:
  - Added `PET_ACTIONS` constant in shared schema defining all action parameters:
    - Feed: +20 hunger, 10 coins, 5min cooldown, 5 XP
    - Play: +15 happiness/-10 energy, 15 coins, 5min cooldown, 10 XP
    - Clean: +25 cleanliness, 12 coins, 5min cooldown, 8 XP
    - Sleep: +30 energy, 0 coins, 5min cooldown (legacy, no frontend timer), 5 XP
  - Created `evaluateCooldown()` helper function to calculate remaining cooldown time
  - Enhanced Feed/Play/Clean routes with cooldown enforcement and coin validation
  - Implemented atomic `performPetAction()` in storage layer (MemStorage + DbStorage):
    - Validates user ownership and resource availability
    - Applies stat deltas with 0-100 clamping
    - Updates action timestamps (lastFed, lastPlayed, lastCleaned)
    - Adds XP with level-up logic
    - Deducts coins from user balance
    - Returns structured payload: `{ pet, user, cooldowns }`
  - Error handling:
    - 409 Conflict: Cooldown active (includes remainingSeconds)
    - 400 Bad Request: Insufficient coins (includes requiredCoins, availableCoins)
- Frontend enhancements:
  - Updated ActionButtons component to accept pet object and isLoading prop
  - Real-time cooldown countdown timers (1-second interval, MM:SS format)
  - Displays coin costs on ready buttons, "Free" for zero-cost actions
  - Created SparkleEffect component with 6 animated particles
  - Sparkle animations trigger on successful actions (timestamp changes)
  - Disabled states during cooldowns and loading
  - All 4 buttons: Feed, Play, Clean (with cooldowns), Sleep (legacy free action)
  - GameHome mutations updated with optimistic cache updates via setQueryData
  - Comprehensive error handling with descriptive toast notifications
- User experience flow:
  1. User clicks action → mutation called
  2. Backend validates cooldown → 409 if active
  3. Backend validates coins → 400 if insufficient
  4. If successful → atomic update of pet + user + timestamp
  5. Frontend receives response → optimistic cache update
  6. Sparkle animation plays → countdown timer starts
  7. Button disabled for 5 minutes → timer counts down
  8. When ready → shows coin cost again
- Architect approved: No security or performance concerns
- Related files: `shared/schema.ts`, `server/routes.ts`, `server/storage.ts`, `client/src/components/ActionButtons.tsx`, `client/src/pages/GameHome.tsx`

**November 11, 2025 - Multi-Pet Creation System**
- Replaced single default "Fluffy" pet with multi-pet system supporting up to 20 pets per user
- Enhanced Pet schema with new fields: type, health, age, evolutionStage, lastFed, lastPlayed, lastCleaned
- Added database index on pets.user_id for performance optimization
- New API endpoints:
  - `POST /api/pets` - Creates new pet with validation, enforces 20-pet limit
  - `GET /api/pets` - Returns all user's pets
- Pet creation features:
  - Random stat generation (60-100 range) for hunger, happiness, energy, cleanliness, health
  - Customizable pet name (max 50 chars) and type
  - Validation using createPetRequestSchema (Zod)
- Frontend features:
  - New "My Pets" page at /my-pets with responsive grid layout
  - Pet creation dialog using shadcn Form + useForm + zodResolver pattern
  - Pet cards display type, level, stats with color-coding (green: 70-100, yellow: 40-69, red: 0-39)
  - Bottom navigation updated with "Pets" tab (PawPrint icon)
  - Loading and empty states for better UX
- Storage layer: Added getAllPetsByUserId() to IStorage interface, implemented in MemStorage and DbStorage
- E2E tested: Pet creation, multi-pet support, stat randomization, navigation verified working
- Architect approved: No security or architectural concerns
- Related files: `shared/schema.ts`, `server/storage.ts`, `server/routes.ts`, `client/src/pages/MyPets.tsx`, `client/src/App.tsx`, `client/src/components/BottomTabNav.tsx`

**November 10, 2025 - JWT Authentication for Mobile/API Access**
- Implemented hybrid authentication system: Session-based for web + JWT tokens for mobile/API
- New endpoints:
  - `GET /api/token` - Issues JWT for authenticated session users
  - `POST /api/token/refresh` - Renews expired access tokens using refresh tokens
- Security features:
  - Access tokens: 15-minute expiration (configurable via JWT_EXPIRATION)
  - Refresh tokens: 7-day expiration (configurable via JWT_REFRESH_EXPIRATION)
  - JWT_SECRET validated at startup (64+ character random string required)
  - Minimal payload: id, email, verified status only
- Mobile app integration:
  1. User logs in via web (session cookie)
  2. App calls GET /api/token to retrieve JWT
  3. App stores JWT securely (SecureStorage/Keychain)
  4. App includes `Authorization: Bearer {token}` header in API requests
  5. When token expires, app calls POST /api/token/refresh
- E2E tested and architect-approved (no security issues)
- Related files: `server/jwt.ts`, `server/routes.ts`

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