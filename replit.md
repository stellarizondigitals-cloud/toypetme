# ToyPetMe Virtual Pet Game

## Overview

ToyPetMe is a mobile-first virtual pet game inspired by Tamagotchi, Neko Atsume, and idle games like Pokémon Smile. The application provides a delightful, stress-free experience where users care for virtual pets through feeding, playing, cleaning, and rest activities. The game features a stat-based progression system, mini-games, rewards, and social elements.

The project is built as a full-stack web application optimized for mobile devices, with a pet care interface, marketplace functionality, and game mechanics. Users must create an account to play, ensuring their pet progress is saved and protected.

## Recent Changes

**November 9, 2025 - Authentication System Improvements & Security Hardening**
- ✅ Fixed login redirect race condition: Added refetchQueries + 100ms delay to ensure auth state propagates
- ✅ Implemented automatic HTTPS redirect middleware for production (301 redirects)
- ✅ Fixed trust proxy configuration for rate limiting (app.set('trust proxy', true))
- ✅ Migrated from MemStorage to PostgreSQL DbStorage for data persistence across server restarts
- ✅ Enhanced email error handling: Resend API errors now properly logged with email IDs
- ✅ Added SESSION_SECRET validation at startup (security improvement)
- ✅ Implemented structured logging for login attempts (masked emails for privacy)
- ✅ Comprehensive testing: All auth flows verified working (signup, login, logout, password reset)
- ✅ Email service confirmed operational: Test email sent successfully to user
- ✅ All architect-recommended security improvements implemented
- Database: PostgreSQL with persistent storage (users, pets, shop_items, inventory tables)
- Session management: Secure cookies with httpOnly, sameSite:lax, proper regeneration
- Rate limiting: 5 requests per 15 minutes on auth endpoints
- HTTPS enforcement: Automatic redirect from HTTP to HTTPS in production

**November 8, 2025 - Phase 2 Google OAuth Integration Complete**
- Google OAuth authentication implemented using Passport.js
- OAuth routes: GET /api/auth/google, GET /api/auth/google/callback
- "Sign in with Google" buttons added to Login and Signup pages
- Account linking: existing local users auto-upgrade when signing in with Google
- Auto-verification: Google sign-ins automatically verify email address
- Username generation from Google display name for new users
- Error handling for missing Google OAuth credentials (returns 503)
- Session regeneration on OAuth callback for security
- Requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL secrets
- Architect-reviewed and approved (no security issues identified)

**November 8, 2025 - Production Email System Fully Operational**
- Resend email service configured with custom domain (toypetme.com)
- DNS records (SPF, DKIM, MX) configured at IONOS and verified
- Email sending from: ToyPetMe <noreply@toypetme.com>
- Environment secrets configured: EMAIL_API_KEY, EMAIL_SENDER, FRONTEND_URL
- Real email delivery confirmed and tested successfully
- Verification links now use correct production URL

**November 8, 2025 - Phase 1 Authentication Upgrade Complete**
- Email verification system with 24-hour token expiry
- Password reset flow with 15-minute secure tokens
- Email service integration with Resend (automatic dev/production mode switching)
- Rate limiting on auth endpoints (5 requests per 15 minutes)
- Email verification banner for unverified users
- Resend verification email functionality
- Dedicated routes: /verify, /forgot-password, /reset-password
- Professional HTML email templates for verification and password reset
- All flows tested end-to-end and fully functional

**November 8, 2025 - Authentication System Implemented**
- Complete session-based authentication with email/password
- Secure signup/login/logout flows with session regeneration (prevents session fixation attacks)
- Protected routes requiring authentication for all game features
- User profile page with account details and logout functionality
- Bottom navigation extended to 5 tabs (Home, Shop, Items, Games, Profile)
- Default pet "Fluffy" created automatically for new users
- Multi-user support throughout backend (replaced demo user approach)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite for fast development and optimized production builds
- **Routing:** Wouter for lightweight client-side routing
- **UI Components:** Radix UI primitives with shadcn/ui component library (New York style)
- **Styling:** Tailwind CSS with custom design system
- **State Management:** TanStack Query (React Query) for server state
- **Forms:** React Hook Form with Zod validation via @hookform/resolvers

**Design System:**
- Custom color palette centered around soft pastels (purple, pink, blue, yellow, green)
- Typography: Outfit font for headings/game UI, Inter for body text
- Mobile-first responsive design with max-width constraints (max-w-2xl for game screens)
- Custom elevation system (hover-elevate, active-elevate-2) for interactive feedback
- Comprehensive theming via CSS custom properties supporting light mode

**Component Architecture:**
- Atomic design approach with reusable UI primitives
- Game-specific components (PetDisplay, StatsPanel, ActionButtons, GameHeader)
- Marketplace components (ProductCard, CategorySection, Hero)
- Navigation components (BottomTabNav with 5 tabs: Home, Shop, Items, Games, Profile)
- Authentication components (Login, Signup, Profile pages)
- Protected route wrapper (ProtectedRoute) with loading states
- Component examples directory for development reference

**Key Features:**
- **Authentication:** 
  - Email/password signup and login with form validation
  - Google OAuth sign-in (requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL)
  - Account linking: local accounts auto-upgrade to Google when signing in with same email
  - Email verification system with resend capability (auto-verified for Google users)
  - Password reset flow with secure token-based reset
  - Verification banner for unverified users
- **Protected Routes:** All game pages require authentication, redirect to login if not signed in
- **User Profile:** Display username, email, join date, and game stats with logout option
- **Virtual Pet Care:** Interaction with mood states (happy, neutral, sad, sleeping)
- **Stat Tracking:** Real-time monitoring of hunger, happiness, energy, cleanliness with progress bars
- **Action System:** Feed, play, clean, sleep actions with stat updates
- **Shop System:** Purchase items with coins and gems
- **Inventory Management:** View and use owned items
- **Mini-games:** Ball Catch game with scoring and rewards
- **Daily Rewards:** Streak tracking with escalating rewards
- **Toast Notifications:** User feedback for all actions
- **Responsive Design:** Mobile and tablet optimized layouts

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js for API routing
- **Authentication:** express-session with bcryptjs password hashing
- **Development Server:** TSX for hot-reloading in development
- **Build Process:** ESBuild for production bundling

**Server Structure:**
- Modular route registration system via `registerRoutes()`
- Request logging middleware with response time tracking
- JSON body parsing with raw body preservation for webhooks
- Vite integration in development for HMR and SSR capabilities
- Session middleware with memory store (configured for PostgreSQL in production)

**Authentication & Security:**
- Session-based authentication (more secure than JWT for web apps)
- Multiple auth methods: email/password (local) and Google OAuth
- Passport.js for OAuth strategy management
- Password hashing with bcryptjs (10 salt rounds) for local auth
- Session regeneration on login/signup (prevents session fixation attacks)
- Protected API routes via requireAuth middleware
- Email uniqueness validation
- Username uniqueness validation
- Account linking: existing local users auto-upgrade when signing in with Google
- Auto-verification for Google OAuth users

**Storage Layer:**
- In-memory storage implementation (`MemStorage`) for development
- Interface-based storage design (`IStorage`) for easy database migration
- Multi-user support with user isolation
- User management with CRUD operations (getUser, getUserByEmail, getUserByUsername, createUser)
- Auto-increment integer IDs for all entities

**API Routes:**
- **Auth:** 
  - POST /api/auth/signup (generates verification token, sends email)
  - POST /api/auth/login
  - POST /api/auth/logout
  - GET /api/auth/google (initiates Google OAuth flow)
  - GET /api/auth/google/callback (handles Google OAuth callback)
  - GET /api/auth/me
  - GET /api/auth/verify (validates verification token)
  - POST /api/auth/resend-verification (resends verification email)
  - POST /api/auth/request-reset (initiates password reset)
  - POST /api/auth/reset-password (completes password reset)
- **User:** GET /api/user (protected)
- **Pet:** GET /api/pet, POST /api/pet/feed, POST /api/pet/play, POST /api/pet/clean, POST /api/pet/sleep (all protected)
- **Shop:** GET /api/shop/items (protected)
- **Inventory:** GET /api/inventory, POST /api/inventory/use/:id (protected)
- **Rewards:** POST /api/rewards/daily (protected)
- **Mini-games:** POST /api/games/ball-catch/start, POST /api/games/ball-catch/end (protected)

**Production Considerations:**
- Designed for database migration (PostgreSQL via Drizzle ORM ready)
- Session store configured to use connect-pg-simple in production
- Static file serving for production builds
- Environment-based configuration

### External Dependencies

**Database:**
- **Planned:** PostgreSQL via Neon serverless (@neondatabase/serverless)
- **ORM:** Drizzle ORM with Zod schema validation
- **Migrations:** Drizzle Kit for schema management
- **Current:** In-memory storage for development (MemStorage class)

**Third-Party Services:**
- **Fonts:** Google Fonts (Inter, Outfit)
- **Icons:** Lucide React icon library
- **Asset Storage:** Local static assets in attached_assets directory (pet images, room backgrounds, product images)

**Development Tools:**
- **Replit Integration:** Vite plugins for cartographer, dev banner, and runtime error overlay
- **Type Safety:** Full TypeScript coverage with path aliases (@/, @shared/, @assets/)
- **Code Quality:** Strict TypeScript configuration with comprehensive type checking

**UI Framework Ecosystem:**
- Radix UI primitives (18+ components including Dialog, Dropdown, Toast, etc.)
- Class Variance Authority for component variant management
- Tailwind Merge and CLSX for className composition
- Embla Carousel for image galleries
- React Day Picker for date selection (if needed for future features)

**Notable Architecture Decisions:**
- **Monorepo Structure:** Shared schema between client and server via `shared/` directory
- **Type Safety:** Drizzle-Zod for runtime validation matching database schema
- **Session-Based Auth:** Chosen over JWT for better security in web app context
- **Session Fixation Protection:** Session regeneration on login/signup
- **Mobile PWA Ready:** Manifest.json configured for installable web app experience
- **Responsive Images:** Asset management through Vite aliases with optimized loading
- **Accessibility:** Radix UI provides ARIA-compliant interactive components
- **State Synchronization:** React Query for caching and optimistic updates preparation
- **Multi-User Architecture:** User isolation at storage layer with per-user pets, inventories, and game progress