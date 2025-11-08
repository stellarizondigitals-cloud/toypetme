# ToyPetMe Virtual Pet Game

## Overview

ToyPetMe is a mobile-first virtual pet game inspired by Tamagotchi, Neko Atsume, and idle games like Pokémon Smile. The application provides a delightful, stress-free experience where users care for virtual pets through feeding, playing, cleaning, and rest activities. The game features a stat-based progression system, mini-games, rewards, and social elements.

The project is built as a full-stack web application optimized for mobile devices, with a pet care interface, marketplace functionality, and game mechanics.

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
- Navigation components (BottomTabNav for game, BottomNav for marketplace)
- Component examples directory for development reference

**Key Features:**
- Virtual pet interaction with mood states (happy, neutral, sad, sleeping)
- Real-time stat tracking (hunger, happiness, energy, cleanliness) with progress bars
- Action-based gameplay (feed, play, clean, sleep)
- Toast notifications for user feedback
- Responsive layouts optimized for mobile and tablet viewports

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js for API routing
- **Development Server:** TSX for hot-reloading in development
- **Build Process:** ESBuild for production bundling

**Server Structure:**
- Modular route registration system via `registerRoutes()`
- Request logging middleware with response time tracking
- JSON body parsing with raw body preservation for webhooks
- Vite integration in development for HMR and SSR capabilities

**Storage Layer:**
- In-memory storage implementation (`MemStorage`) for development
- Interface-based storage design (`IStorage`) for easy database migration
- User management with CRUD operations
- UUID-based entity identification

**Production Considerations:**
- Designed for database migration (PostgreSQL via Drizzle ORM ready)
- Session management prepared (connect-pg-simple included)
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
- **Mobile PWA Ready:** Manifest.json configured for installable web app experience
- **Responsive Images:** Asset management through Vite aliases with optimized loading
- **Accessibility:** Radix UI provides ARIA-compliant interactive components
- **State Synchronization:** React Query for caching and optimistic updates preparation