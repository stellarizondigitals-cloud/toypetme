# ToyPetMe Virtual Pet Game

## Overview
ToyPetMe is a free, viral-friendly virtual pet game inspired by Tamagotchi, delivered as a mobile-first web application. No sign-up required — players visit and play instantly. Progress is saved in the browser (localStorage). The game features 5 unique pet species with 4 evolution stages each, a stat-based care system (hunger, happiness, energy, cleanliness), 3 client-side mini-games, a daily streak system, 27 achievements, social sharing, and ad slots for monetization. Designed for maximum SEO and viral reach.

## Architecture: Client-First + Stripe Payments

### Key Principle
- **100% client-side game logic** — all state stored in `localStorage` (`toypetme_v2` key)
- **No login/auth required** — players play immediately
- **Stripe payments** — optional £0.99 Premium + coin packs via Stripe guest checkout (no account needed)
- **Premium stored in localStorage** (`toypetme_premium = "1"`) after verified Stripe checkout
- **Stripe integration** managed by Replit's native Stripe connector + `stripe-replit-sync`

### Server
- `server/index.ts` — Express server with Stripe webhook (registered BEFORE express.json), Stripe schema init
- `server/routes.ts` — `/api/health`, `/api/products`, `/api/checkout/session`, `/api/checkout/verify`
- `server/stripeClient.ts` — Fetches Stripe credentials from Replit connector API
- `server/webhookHandlers.ts` — Processes Stripe webhooks via stripe-replit-sync
- `server/db.ts` — Drizzle ORM client (PostgreSQL, for stripe-replit-sync schema)
- `scripts/seed-products.ts` — Creates ToyPetMe products in Stripe (run manually)

### Client Architecture
**Technology:** React 18 + TypeScript + Vite + Wouter + Tailwind CSS + shadcn/ui

**Core Libraries:**
- `client/src/lib/gameStorage.ts` — All game state: pet creation, actions, decay, achievements, daily login
- `client/src/lib/petData.ts` — Pet species metadata, achievement definitions, name suggestions

**Pages:**
- `/` — `GameHome.tsx` — Main game screen (create pet / care for pet)
- `/collection` — `Collection.tsx` — Pet collection + species compendium
- `/minigames` — `MiniGamesHub.tsx` — 8 client-side mini-games: Tap Rush (combo system), Memory Match, Feed Frenzy, Pet Jump (Flappy Bird), Whack-a-Pet (Whack-a-Mole), 2048 Pets, Snake Feast, Brick Breaker (Breakout). All earn coins. Ads between game cards and in every game view.
- `/stories` — `Stories.tsx` — Pet lore/species story page (5 in-world stories with ads between every card)
- `/stories/:slug` — `StoryDetail` (exported from Stories.tsx) — Per-species story page with unique SEO meta
- `/dress-up` — `DressUp.tsx` — Full dress-up: 7 hats, 7 outfits, 5 accessories, 6 backgrounds — SVG-layered on pet; wide-screen sidebar ad
- `/leaderboard` — `Leaderboard.tsx` — Rankings, high scores, recent achievements
- `/achievements` — `Achievements.tsx` — Full achievement list with progress
- `/shop` — `Shop.tsx` — Premium (£0.99) + coin packs (£0.99/£1.99/£4.99) via Stripe guest checkout
- `/checkout/success` — `CheckoutSuccess.tsx` — Verifies Stripe session, activates premium/coins in localStorage
- `/checkout/cancel` — `CheckoutCancel.tsx` — Payment cancelled page
- `/refund-policy` — `RefundPolicy.tsx` — Full 14-day refund policy (GDPR/UK Consumer Rights compliant)
- `/privacy` — `PrivacyPolicy.tsx` — Privacy policy (includes Stripe payment data section)
- `/terms` — `Terms.tsx` — Terms of Service (includes in-app purchases + refund rights)

**Lib:**
- `client/src/lib/usePageMeta.ts` — SEO hook for per-page title, description, Open Graph, and canonical URLs
- `client/index.html` — VideoGame JSON-LD + ItemList JSON-LD for 5 pet species

**Components:**
- `PetDisplay.tsx` — Full-body animated SVG pet characters (100x160 viewBox) with stage-aware scaling, CSS keyframe animations (bounce/jump/spin/shimmy/sleep), blinking eyes, floating stat text, action particles. Accepts optional `dressUp` prop and renders DressUpOverlay SVG layers (hats, outfits, accessories) directly on the pet SVG. Exports DressUpState type and individual species SVGs.
- `ActionButtons.tsx` — Feed/Play/Clean/Sleep with live cooldown timers
- `StatsPanel.tsx` — Hunger/Happy/Energy/Cleanliness stat bars with real-time decay
- `GameHeader.tsx` — Coins, streak, level + settings gear icon (How to Play modal, Pet Stories link, Dress Up link, Reset Game confirmation)
- `BottomTabNav.tsx` — 5-tab navigation
- `AdSlot.tsx` — Google AdSense-ready placeholders (banner, rectangle, leaderboard formats)

### Game Mechanics
- **5 pet species:** Mystic Cat, Star Pup, Fire Drake, Moon Bunny, Crystal Axolotl
- **4 evolution stages:** Baby → Kid → Teen → Adult (at levels 1, 5, 15, 30)
- **Stat decay:** Hunger −2/hr, Happiness −1.5/hr, Energy −1/hr, Cleanliness −1/hr
- **Action cooldowns:** Feed 5min, Play 3min, Clean 10min, Sleep 15min
- **Daily streak:** Bonus coins each day, larger bonuses at streak milestones
- **40 achievements** with rewards — including score milestones for all 8 mini-games + games-played milestones (1/10/50 games)
- **8 mini-games:** Tap Rush (with combo multiplier), Memory Match, Feed Frenzy, Pet Jump (Flappy Bird-inspired, canvas), Whack-a-Pet (Whack-a-Mole, DOM), 2048 Pets (merge tiles, arrow keys + swipe), Snake Feast (canvas, D-pad), Brick Breaker (Breakout, canvas) — all earn coins

### Monetization
- Google AdSense slots in `AdSlot.tsx` — ready to activate by pasting Publisher ID in `client/index.html`
- Ad formats: 320×50 banner, 300×250 rectangle, 728×90 leaderboard

### SEO
- Full meta tags, Open Graph, Twitter Card in `client/index.html`
- JSON-LD structured data (VideoGame schema)
- Descriptive page titles and descriptions

## Blog & SEO Content
- `/blog` — `Blog.tsx` — Blog index with category filter (All / Guides / Tips & Tricks / News & Culture), featured article hero, article cards
- `/blog/:slug` — `BlogPost.tsx` — Full article view with Article + FAQPage JSON-LD, related articles, CTA, FAQ section
- `client/src/lib/blogData.ts` — 10 rich SEO articles covering: beginner guide, evolution guide, Tamagotchi history, tips, species guide, browser games 2025, mini-games guide, achievements guide, ToyPetMe vs Tamagotchi, virtual pets & child development

## SEO
- All URLs updated from `toypetme.replit.app` → `toypetme.com` in index.html, usePageMeta.ts, sitemap.xml, robots.txt
- Enhanced meta keywords (30+ keyword phrases)
- Structured data schemas: WebSite (with SearchAction), VideoGame, Organization, BreadcrumbList, FAQPage, HowTo, Article, ItemList
- Sitemap includes all 25 pages including all blog articles and story pages with lastmod dates
- robots.txt blocks /api/ and /checkout/ from crawlers

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
