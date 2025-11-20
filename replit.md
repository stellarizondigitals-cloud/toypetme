# ToyPetMe Virtual Pet Game

## Overview
ToyPetMe is a mobile-first virtual pet game, inspired by Tamagotchi and idle games, delivered as a full-stack web application. Users care for 20 unique virtual pets, each with distinct personalities and evolution paths, through activities like feeding, playing, cleaning, and rest. The game features a stat-based progression system, mini-games, a comprehensive currency system, stat decay mechanics, and rewards. It aims to provide a delightful, stress-free experience with account creation required to save pet progress and manage multiple pets. Key features include a global leaderboard, pet collection showcase, social sharing, and an in-app store with premium benefits.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
**Technology Stack:** React 18 (TypeScript), Vite, Wouter, Radix UI primitives with shadcn/ui, Tailwind CSS, TanStack Query, React Hook Form with Zod validation.
**Design System:** Mobile-first responsive design (max-w-2xl), custom color palette (soft pastels), Outfit and Inter typography, custom elevation, light mode theming.
**Component Architecture:** Atomic design, reusable UI components for game, marketplace, navigation, and authentication, protected route wrapper.
**Key Features:** Email/password and Google OAuth, email verification, password reset, user profiles, virtual pet care (hunger, happiness, energy, cleanliness, health, age), action system with cooldowns and animated feedback, shop/inventory management, mini-games, daily rewards, toast notifications.

### Backend Architecture
**Technology Stack:** Node.js (TypeScript), Express.js, express-session with bcryptjs, TSX, ESBuild.
**Server Structure:** Modular routes, request logging, JSON parsing, Vite integration, session middleware.
**Authentication & Security:** Session-based (email/password, Google OAuth via Passport.js) with bcryptjs, session regeneration, protected API routes, JWT tokens (mobile/API), email/username uniqueness, account linking, Google OAuth auto-verification.
**Storage Layer:** Interface-based (`IStorage`) for multi-user support, CRUD for user/pet management, stat decay logic, atomic action execution.
**API Routes:**
- **Auth:** Signup, login, logout, Google OAuth, verify, resend verification, password reset, `me`, JWT issuance/refresh.
- **User:** Profile, toggle premium.
- **Pet:** Creation, view all, feed, play, clean, sleep.
- **Shop:** Items, purchase.
- **Inventory:** View, use items.
- **Rewards:** Daily.
- **Ads:** Watch bonus (free users).
- **Store:** Purchase items (demo mode).
- **Mini-games:** Ball catch.
- **Leaderboard:** Global rankings (highest level, most pets, total coins).

### Notable Architecture Decisions
- **Monorepo Structure:** `shared/` directory for client-server type safety.
- **Type Safety:** Drizzle-Zod for runtime validation.
- **Authentication:** Session-based for web, JWT for mobile/API.
- **Mobile PWA Ready:** `manifest.json`.
- **Responsive Images:** Optimized loading.
- **Accessibility:** Radix UI for ARIA-compliant components.
- **State Synchronization:** React Query for caching and optimistic updates.
- **Multi-User Architecture:** User isolation for pets, inventories, progress.
- **Economic Model:** Actions earn coins, daily login bonus, MAX_COINS cap (5,000), 5-minute action cooldowns, shop system.
- **Stat Decay:** Per-stat decay timestamps for hunger, happiness, cleanliness, health, `isSick` flag.
- **Global Leaderboard:** Three categories, optimized SQL queries, top 50 display with user highlight.
- **Pet Collection & Social Sharing:** Grid layout with pet stats, social sharing card (Twitter/X, Facebook, Instagram/TikTok clipboard).
- **In-App Store:** 6 purchasable items (eggs, coin packs, booster), premium discount, demo mode payments, prepared for Stripe/PayPal.
- **Ad Integration:** Simulated 30-second ads for free users (5 per day limit), 50 coins per ad reward, premium users have no ads.
- **Premium Monetization:** Manual toggle for premium status, GoPremium page listing benefits, premium badge display.

## External Dependencies

**Database:**
- **Planned:** PostgreSQL via Neon serverless (@neondatabase/serverless).
- **ORM:** Drizzle ORM.
- **Migrations:** Drizzle Kit.
- **Current (Development):** In-memory storage (MemStorage).

**Third-Party Services:**
- **Email:** Resend API.
- **Google OAuth:** Google API.
- **Fonts:** Google Fonts (Inter, Outfit).
- **Icons:** Lucide React.

**Development Tools:**
- **Replit Integration:** Vite plugins (cartographer, dev banner, runtime error overlay).
- **Type Safety:** TypeScript.

**UI Framework Ecosystem:**
- Radix UI primitives.
- Class Variance Authority.
- Tailwind Merge and CLSX.
- Embla Carousel.