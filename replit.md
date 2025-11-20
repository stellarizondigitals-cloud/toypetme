# ToyPetMe Virtual Pet Game

## Overview
ToyPetMe is a mobile-first virtual pet game inspired by Tamagotchi and idle games, delivered as a full-stack web application. Users care for virtual pets through activities like feeding, playing, cleaning, and rest, progressing through a stat-based system, mini-games, and rewards. The game aims to provide a delightful, stress-free experience with 20 unique virtual pets, each having distinct personalities and evolution paths. Account creation is required to save pet progress. The project focuses on a comprehensive currency system, stat decay mechanics, and a multi-pet management system.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Updates

**November 20, 2025 - Pet Collection & Social Sharing (Phase 4 - Prompt 13)**
- Implemented Pet Collection showcase page with social media sharing capabilities
- **Collection Page Features:**
  - View all owned pets in a grid layout with comprehensive stats
  - Pet cards display: name, type, level, XP, evolution stage, health, age, happiness, hunger, energy
  - Sorting: By level (descending), then by creation date
  - Trophy badges for level 20+ pets
  - Color-coded stat indicators (green/yellow/red based on thresholds)
  - Empty state with CTA to create first pet
  - Sick status indicator with visual cues
- **Social Sharing System:**
  - Shareable pet card modal with gradient design
  - Pre-filled share text (no emojis): "Check out my ToyPetMe! Meet {name}, a Level {level} {stage} {type}!"
  - Social media buttons: Twitter/X, Facebook, Instagram, TikTok
  - Twitter/Facebook: Web share intents with pre-filled text and URL
  - Instagram/TikTok: Copy to clipboard with toast notification (no web API support)
  - Share URL uses window.location.origin for proper domain
- **Authentication Improvements:**
  - Updated `ProtectedRoute` to use `getQueryFn({ on401: "returnNull" })` pattern
  - Proper differentiation: 401 → redirect to login, other errors → show retry UI
  - Collection page uses effect-based navigation (no render-time redirects)
  - Type-safe auth flow throughout
  - Added data-testid to retry button for testing
- **Navigation:**
  - Added Collection tab to bottom navigation (Trophy icon)
  - Route registered in App.tsx (/collection)
  - Replaced Pets tab with Collection tab for better UX
- **UI/UX Enhancements:**
  - Uses shadcn Button, Card, Dialog components
  - Mobile-responsive design (max-w-2xl constraint)
  - Loading states with safe defaults (coins={0})
  - Error handling with friendly messages
  - Toast notifications for clipboard operations
- **Testing:**
  - ✅ All LSP diagnostics resolved
  - ✅ App running successfully with hot module reloading
  - ✅ Auth flow properly handles 401 and other errors
  - ✅ Collection page protected with proper guards
- **Architect approved:** Proper auth handling, no security gaps, production-ready implementation
- **Related files:** `client/src/pages/Collection.tsx`, `client/src/App.tsx`, `client/src/components/BottomTabNav.tsx`, `client/src/lib/queryClient.ts`

**November 20, 2025 - In-App Store with Demo Mode Purchases (Phase 4 - Prompt 11)**
- Implemented comprehensive in-app Store page with 6 purchasable items
- **Store Items:**
  - Pet Eggs: Common (£0.99), Rare (£2.99), Legendary (£4.99)
  - Coin Packs: 100 coins (£0.99), 500 coins (£3.99)
  - Evolution Booster (£1.99)
- **Backend implementation:**
  - Created API endpoint: POST /api/store/purchase (protected, demo mode)
  - Coin pack purchases: Add coins to user account (respects MAX_COINS cap of 5000)
  - Egg/booster purchases: Logged as stubs for future inventory system
  - Payment integration: Demo mode only (no real charges)
  - Proper validation and error handling
- **Frontend implementation:**
  - Created Store page (/store) with grid layout of items
  - Purchase confirmation modals with detailed item info
  - Premium discount: 10% off all purchases for premium users
  - Payment method notice: Stripe/PayPal placeholders for future integration
  - React Query mutation for purchase flow with cache invalidation
  - Toast notifications for success/error states
  - Lucide CreditCard icon (no emojis per design guidelines)
  - Loading states with mutation.isPending
- **Navigation:**
  - Added Store tab to bottom navigation (replaced emoji with CreditCard icon)
  - Route registered in App.tsx (/store)
- **Economic balance:**
  - 100 coin pack: £0.99 (premium: £0.89)
  - 500 coin pack: £3.99 (premium: £3.59)
  - Complements existing earning methods (actions, ads, daily rewards)
- **Ready for production:**
  - Stripe/PayPal integration placeholders
  - Backend endpoint prepared for real payment webhooks
  - Future enhancements: Zod validation for payloads, inventory system for eggs/boosters
- **Testing:**
  - ✅ Coin packs add coins correctly
  - ✅ Premium discount applied correctly
  - ✅ Purchase confirmation flow works end-to-end
  - ✅ Cache invalidation updates UI immediately
  - ✅ All LSP diagnostics resolved
- **Architect approved:** Clean separation of concerns, proper security, ready for payment integration
- **Related files:** `client/src/pages/Store.tsx`, `server/routes.ts`, `client/src/components/BottomTabNav.tsx`, `client/src/App.tsx`

**November 19, 2025 - Ad Integration Placeholder (Phase 4 - Prompt 10)**
- Implemented ad watching system with simulated 30-second ads for free users
- Database schema:
  - Added `adsWatchedToday: integer` field to users table (default: 0)
  - Added `lastAdDate: timestamp` field to track daily reset
  - Database migration via `npm run db:push` successfully applied
- Backend implementation:
  - Added `watchAdBonus(userId)` method to IStorage interface (both MemStorage and DbStorage)
  - Daily reset logic: Resets adsWatchedToday to 0 at midnight
  - 5 ads per day limit enforcement
  - 50 coins per ad reward (respects MAX_COINS cap)
  - Created API endpoint: POST /api/ads/watch-bonus (protected, returns user, coinsEarned, adsRemaining)
  - Error handling: 403 for premium users, 429 for daily limit exceeded
- Frontend implementation:
  - Created AdBanner component with:
    - Hidden for premium users (returns null if user.premium === true)
    - Banner display: "Earn Bonus Coins" title, "X of 5 ads available today" counter
    - "Watch Ad for Bonus" button (+50 Coins)
    - 30-second countdown simulation with Clock icon animation
    - Animated progress bar during ad watching
    - Button disabled when limit reached ("Limit Reached" text)
    - Toast notifications on success/error
    - Interval cleanup with useRef to prevent memory leaks
    - Dark mode support for gradients, borders, and icons
  - Added AdBanner to GameHome page (bottom of main pet screen, before BottomTabNav)
  - Only visible for non-premium users
- Economic balance:
  - Max 250 coins per day from ads (5 ads × 50 coins)
  - Complements existing earning methods (pet actions, daily login)
- Premium differentiation:
  - Free users: See ad banner, can watch up to 5 ads/day
  - Premium users: No ads shown at all (clean experience)
- Testing:
  - ✅ Free users can watch ads and earn coins correctly
  - ✅ 30-second simulation works with countdown and progress bar
  - ✅ Daily limit enforced (5 ads max)
  - ✅ Premium users see NO ads (component hidden)
  - ✅ All end-to-end tests passing
- Architect approved: Clean implementation, proper security, good economic balance
- Related files: `shared/schema.ts`, `server/storage.ts`, `server/routes.ts`, `client/src/components/AdBanner.tsx`, `client/src/pages/GameHome.tsx`

**November 12, 2025 - Premium Monetization Features (Phase 4 - Prompt 9)**
- Implemented premium subscription system with manual toggle for testing
- Database schema:
  - Added `premium: boolean` field to users table (default: false)
  - Database migration via `npm run db:push` successfully applied
- Backend implementation:
  - Added `togglePremium(userId)` method to IStorage interface (both MemStorage and DbStorage)
  - Created API endpoint: POST /api/user/toggle-premium (protected, returns updated user)
- Frontend implementation:
  - Created GoPremium page (/premium) showing 6 premium benefits
  - Updated bottom navigation: Replaced Profile tab with Premium tab
  - Added premium badge to GameHeader (Crown icon + "Premium" text)
  - All pages pass premium prop to GameHeader for consistent badge display
  - Profile page fixed to use `/api/user` query for full user object
- Premium benefits listed:
  - Unlimited pet slots (free users: 1 pet)
  - Exclusive pet types
  - 2x coin earnings
  - Rare evolution paths
  - No advertisements
  - Premium badge (IMPLEMENTED ✅, others ready for future implementation)
- Testing mode: Manual toggle button allows instant premium activation/deactivation
- Ready for future payment integration (Stripe/payment services)
- Architect approved: Clean separation, consistent badge across all pages
- Related files: `shared/schema.ts`, `server/storage.ts`, `server/routes.ts`, `client/src/pages/GoPremium.tsx`, `client/src/components/GameHeader.tsx`, `client/src/components/BottomTabNav.tsx`, `client/src/App.tsx`

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
- **User:** User profile, toggle premium.
- **Pet:** Creation, viewing all pets, feed, play, clean, sleep actions.
- **Shop:** Shop items, purchase.
- **Inventory:** View, use items.
- **Rewards:** Daily rewards.
- **Ads:** Watch ad bonus (free users only).
- **Store:** Purchase items (demo mode).
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