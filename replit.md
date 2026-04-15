# ToyPetMe Virtual Pet Game

## Overview
ToyPetMe is a free, viral-friendly virtual pet game inspired by Tamagotchi, delivered as a mobile-first web application. No sign-up required — players visit and play instantly. Progress is saved in the browser (localStorage). The game features 5 unique pet species with 4 evolution stages each, a stat-based care system (hunger, happiness, energy, cleanliness), 3 client-side mini-games, a daily streak system, 27 achievements, social sharing, and ad slots for monetization. Designed for maximum SEO and viral reach.

## Architecture: Static-First, Zero Backend Complexity

### Key Principle
- **100% client-side game logic** — all state stored in `localStorage` (`toypetme_v2` key)
- **No login/auth required** — players play immediately
- **No database** — no PostgreSQL, no Supabase, no external services
- **Minimal server** — Express only serves the Vite frontend (no DB routes, no auth routes)
- **Free hosting** — Replit subscription only, no extra costs

### Server (Simplified)
- `server/index.ts` — Minimal Express server, just serves Vite
- `server/routes.ts` — Single `/api/health` endpoint only
- No database, no sessions, no Passport, no Stripe

### Client Architecture
**Technology:** React 18 + TypeScript + Vite + Wouter + Tailwind CSS + shadcn/ui

**Core Libraries:**
- `client/src/lib/gameStorage.ts` — All game state: pet creation, actions, decay, achievements, daily login
- `client/src/lib/petData.ts` — Pet species metadata, achievement definitions, name suggestions

**Pages:**
- `/` — `GameHome.tsx` — Main game screen (create pet / care for pet)
- `/collection` — `Collection.tsx` — Pet collection + species compendium
- `/minigames` — `MiniGamesHub.tsx` — 3 client-side mini-games (Tap Rush, Memory Match, Feed Frenzy)
- `/leaderboard` — `Leaderboard.tsx` — Rankings, high scores, recent achievements
- `/achievements` — `Achievements.tsx` — Full achievement list with progress

**Components:**
- `PetDisplay.tsx` — Animated SVG pet characters with mood system and floating text effects
- `ActionButtons.tsx` — Feed/Play/Clean/Sleep with live cooldown timers
- `StatsPanel.tsx` — Hunger/Happy/Energy/Cleanliness stat bars with real-time decay
- `GameHeader.tsx` — Coins, streak, level display
- `BottomTabNav.tsx` — 5-tab navigation
- `AdSlot.tsx` — Google AdSense-ready placeholders (banner, rectangle, leaderboard formats)

### Game Mechanics
- **5 pet species:** Mystic Cat, Star Pup, Fire Drake, Moon Bunny, Crystal Axolotl
- **4 evolution stages:** Baby → Kid → Teen → Adult (at levels 1, 5, 15, 30)
- **Stat decay:** Hunger −2/hr, Happiness −1.5/hr, Energy −1/hr, Cleanliness −1/hr
- **Action cooldowns:** Feed 5min, Play 3min, Clean 10min, Sleep 15min
- **Daily streak:** Bonus coins each day, larger bonuses at streak milestones
- **27 achievements** with rewards
- **3 mini-games:** Tap Rush, Memory Match, Feed Frenzy — all fully client-side

### Monetization
- Google AdSense slots in `AdSlot.tsx` — ready to activate by pasting Publisher ID in `client/index.html`
- Ad formats: 320×50 banner, 300×250 rectangle, 728×90 leaderboard

### SEO
- Full meta tags, Open Graph, Twitter Card in `client/index.html`
- JSON-LD structured data (VideoGame schema)
- Descriptive page titles and descriptions

## Legal Pages
- `/privacy` — Full Privacy Policy (GDPR, CCPA, AdSense compliant), under Stellarizon Digitals
- `/terms` — Terms of Service
- `CookieBanner.tsx` — GDPR cookie consent popup (appears after 1.2s delay, stores choice in localStorage)
- `Footer.tsx` — Appears on every game page with Privacy Policy, Terms, company links, contact

## Ad Placements (Maximized)
- **Sticky anchor banner** inside `BottomTabNav` — always visible above nav tabs (highest CPM on mobile)
- **Top banner** (320×50) — top of every page
- **Mid-page rectangle** (300×250) — middle of every page (after main content)
- **In-game banner** — shown above mini-game canvas during active gameplay
- **Post-game rectangle** — shown below game card after game ends
- All slots ready for Google AdSense `ca-pub-XXXXXXXXXXXXXXXX` publisher ID activation

## User Preferences
- Simple, everyday language
- 100% free-tier infrastructure (no paid hosting, databases, or services)
- Easy to manage, no complex backend
- Static/minimal approach

## Development
- Start: `npm run dev` (Express + Vite on port 5000)
- No database migrations needed
- No environment variables required for basic game operation
