# ToyPetMe Design Guidelines

## Design Approach
**Reference-Based**: Drawing inspiration from Etsy and Shopify's playful yet trustworthy e-commerce patterns, combined with modern pet-tech apps like Rover and Chewy. This approach balances emotional connection with pets while maintaining clear product discovery and purchasing flows.

## Core Design Principles
1. **Playful Professionalism**: Friendly, approachable interface that builds trust
2. **Visual Product Discovery**: Image-forward design showcasing toys and pets
3. **Mobile-First Interaction**: Touch-optimized components for PWA experience
4. **Quick Decision Making**: Clear product information and fast checkout flows

## Typography System

**Font Families** (via Google Fonts):
- Primary: 'Inter' (400, 500, 600, 700) - UI elements, body text
- Accent: 'Outfit' (600, 700) - Headings, CTAs

**Hierarchy**:
- Hero Headlines: text-5xl md:text-6xl, font-bold (Outfit)
- Section Headers: text-3xl md:text-4xl, font-semibold (Outfit)
- Product Titles: text-xl font-semibold (Inter)
- Body Text: text-base leading-relaxed (Inter)
- Small Labels: text-sm font-medium (Inter)

## Layout System

**Spacing Units**: Consistent use of Tailwind units - 4, 6, 8, 12, 16, 20, 24 for predictable rhythm

**Grid Structure**:
- Container: max-w-7xl mx-auto px-4 md:px-6
- Product Grids: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6
- Feature Sections: grid-cols-1 md:grid-cols-2 gap-12

**Vertical Rhythm**:
- Section Padding: py-12 md:py-20
- Component Spacing: space-y-8 md:space-y-12
- Card Internal: p-4 md:p-6

## Component Library

### Navigation
**Header**: Sticky top navigation with logo left, search center, cart/profile right. Mobile: Hamburger menu with slide-out drawer.
- Height: h-16 md:h-20
- Search bar: Prominent, rounded-full, with icon

### Hero Section
**Layout**: Full-width with large background image featuring happy pets with toys
- Height: min-h-[500px] md:min-h-[600px]
- Overlay: Semi-transparent gradient for text legibility
- CTA Buttons: Blurred background (backdrop-blur-sm), large touch targets (px-8 py-4)
- Content: Left-aligned on desktop, centered on mobile

### Product Cards
**Structure**: 
- Image container: aspect-square with rounded-lg overflow-hidden
- Hover state: Subtle scale transform (scale-105)
- Price: Prominent, bold
- Quick actions: Floating heart icon (wishlist), add to cart button
- Rating: Star display with review count

### Category Sections
**Pet Type Navigation**: Horizontal scroll on mobile, grid on desktop
- Cards: Rounded-xl with pet silhouette/icon and category name
- Size: Equal height, min-w-[120px] on mobile

### Features/Benefits
**Layout**: 2-column grid showcasing app benefits
- Icons: Large (w-12 h-12), rounded backgrounds
- Content: Icon left, text right on desktop; stacked on mobile

### Social Proof
**Testimonials**: Card-based layout with customer photos
- Grid: grid-cols-1 md:grid-cols-3
- Photos: Circular (rounded-full), 60px diameter
- Content: Quote, name, pet type

### Footer
**Rich Footer**: 4-column layout (mobile: stacked)
- Sections: Shop by Pet, Quick Links, Contact, Newsletter
- Newsletter: Inline form with rounded input + button
- Social icons: Prominent, bottom section

## PWA-Specific Design

**Mobile Optimizations**:
- Bottom Navigation Bar: Fixed bottom nav for key actions (Home, Search, Cart, Profile) - h-16
- Touch Targets: Minimum 44px for all interactive elements
- Pull-to-Refresh: Native feel with custom loading animation
- Floating Action Button: Add product quick action (bottom-right, above bottom nav)

**App-Like Features**:
- Splash Screen: Logo centered on solid background
- Install Prompt: Slide-up banner with "Add to Home Screen" CTA

## Images Strategy

**Required Images**:

1. **Hero Image**: Large, joyful scene of pets playing with colorful toys in bright environment. Full-width, high-quality (1920x1080+)

2. **Product Images**: Square format, clean white/minimal backgrounds, showing toy details and scale. Multiple angles per product.

3. **Category Images**: Pet silhouettes or simple illustrations for each pet type (Dogs, Cats, Birds, Small Pets)

4. **Testimonial Photos**: Authentic customer photos with their pets and purchased toys

5. **Feature Icons**: Use Heroicons CDN for consistent iconography throughout

## Form Design

**Inputs**: 
- Style: Rounded-lg, border-2, focus:ring-2 pattern
- Height: h-12 for comfortable touch interaction
- Labels: Above input, text-sm font-medium
- Validation: Inline error messages below input

**Buttons**:
- Primary: Large rounded-lg, px-6 py-3, font-semibold
- Secondary: Outlined variant with hover fill
- Icon buttons: rounded-full, w-10 h-10 for consistent sizing

## Data Display

**Product Filtering**:
- Sidebar on desktop (w-64), slide-over on mobile
- Checkbox groups with clear labels
- Price range slider with visual feedback

**Product Detail**:
- Image Gallery: Main image with thumbnail strip below
- Specifications: Clean table or definition list
- Quantity Selector: Rounded buttons with number display

**Shopping Cart**:
- Line items: Thumbnail left, details center, price/remove right
- Sticky summary: Fixed on scroll with total and checkout

## Animations
Use sparingly for polish:
- Card hover: transition-transform duration-200
- Image loading: Skeleton screens with pulse animation
- Page transitions: Fade-in on route change (duration-300)
- Cart add: Brief scale animation on cart icon

This design creates an engaging, trustworthy pet toy marketplace optimized for mobile PWA installation while maintaining desktop usability.