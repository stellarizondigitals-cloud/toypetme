# ToyPetMe Virtual Pet Game - Design Guidelines

## Design Approach
**Game-First Mobile Experience**: Inspired by Tamagotchi, Neko Atsume, and modern idle games like Pokémon Smile. Focus on delightful interactions, smooth animations, and a soothing, stress-free experience that encourages daily check-ins.

## Core Design Principles
1. **Joyful Simplicity**: Clear, intuitive UI that anyone can pick up instantly
2. **Emotional Connection**: Cute, expressive pets that feel alive and responsive
3. **Calming Aesthetics**: Soft colors, gentle animations, stress-relief focus
4. **Rewarding Progression**: Visual feedback for every action, satisfying growth mechanics

## Color Palette

**Primary Colors**:
- Soft Purple: #a855f7 (main brand, magical feel)
- Warm Pink: #ec4899 (love, happiness, hearts)
- Sky Blue: #3b82f6 (calm, trust, water activities)
- Sunny Yellow: #fbbf24 (energy, play, positivity)
- Fresh Green: #10b981 (health, nature, growth)

**Backgrounds**:
- Light cream: #fef9f3 (warm, cozy base)
- Soft white: #ffffff (clean cards and panels)
- Pastel gradients for game screens

**UI Elements**:
- Text: Dark gray #1f2937 for readability
- Secondary text: Medium gray #6b7280
- Borders: Soft #e5e7eb

## Typography System

**Font Families**:
- Primary: 'Outfit' (600, 700) - Headings, pet names, game UI
- Secondary: 'Inter' (400, 500, 600) - Stats, descriptions, body text

**Hierarchy**:
- Pet Name: text-2xl md:text-3xl font-bold (Outfit)
- Section Headers: text-xl md:text-2xl font-semibold (Outfit)
- Button Text: text-base font-semibold (Inter)
- Stat Labels: text-sm font-medium (Inter)
- Body Text: text-base (Inter)

## Layout System

**Mobile-First Game Screen**:
- Container: max-w-2xl mx-auto (optimized for pet viewing)
- Primary padding: p-4 md:p-6
- Vertical spacing: space-y-6 for comfortable scrolling

**Component Spacing**:
- Tight: gap-2 (within button groups)
- Medium: gap-4 (between related elements)
- Large: gap-6 (between major sections)

## Component Library

### Pet Display Area
**Main Pet View**: 
- Large centered display (min-h-[400px])
- Animated pet character responds to interactions
- Background: gradient or illustrated room
- Floating UI elements (hearts, sparkles, zzz) appear on interaction

### Stats Bars
**Health/Status Indicators**:
- Progress bars with rounded ends (rounded-full)
- Color-coded: Hunger (pink), Happiness (yellow), Energy (blue), Cleanliness (green)
- Icon + label + percentage
- Smooth transitions on value changes
- Warning states when low (< 30%)

### Action Buttons
**Primary Actions** (Feed, Play, Clean, Sleep):
- Large touch targets (min 56px height)
- Icon + text label
- Rounded-xl design
- Color variants matching stat types
- Haptic-like visual feedback (scale on press)
- Disabled state when stat is full

**Secondary Actions**:
- Smaller icon-only buttons
- Settings, shop, friends in top corners

### Mini-Games Panel
**Game Selection**:
- Card-based grid
- Preview thumbnail + game name
- "Play" button
- Lock state for未unlocked games
- Reward indicators (coins, experience)

### Inventory & Shop
**Item Cards**:
- Square aspect ratio
- Item image centered
- Name + cost/quantity below
- Tap to use/buy with confirmation
- Badge for "New" items

### Social Features
**Friends List**:
- Avatar circles (w-12 h-12)
- Pet name + owner name
- "Visit" button
- Online status indicator (small colored dot)

**Gift Interface**:
- Item selection modal
- Send animation with hearts/sparkles
- Notification badge for received gifts

### Navigation
**Bottom Tab Bar** (Mobile):
- 4-5 tabs: Home, Games, Shop, Friends, Profile
- Icon + label
- Active state with color change
- Fixed position, z-50

**Top Header** (persistent):
- Currency display (coins, gems)
- Settings icon
- Notification bell with badge

## Animations & Interactions

**Pet Animations** (CSS/Framer Motion):
- Idle: gentle bounce or sway
- Happy: jump with hearts
- Eating: chomp animation + satisfaction expression
- Sleeping: zzz bubbles, gentle breathing
- Playing: excited movement with stars
- Sad/Hungry: droopy appearance, slower movement

**UI Feedback**:
- Button press: scale-95 on active
- Stat fill: smooth width transition (duration-500)
- Item collection: fly-to animation
- Level up: celebration modal with confetti
- Purchase: coin spin animation

**Transitions**:
- Page changes: fade-in duration-300
- Modal open: scale-95 to scale-100 + fade
- Toast notifications: slide-in from top

## Game-Specific UI Patterns

### Status Cards
Compact info display:
- Level badge (top-right corner)
- XP progress bar
- Pet age counter
- Mood emoji indicator

### Notification System
- Toast messages for events
- Animated badge counters
- Gentle sound effects (optional)

### Progression Feedback
- "+10 Happiness" floating text
- Star rating for activities
- Unlock animations for new content
- Daily streak calendar

## PWA & Mobile Optimization

**Touch Interactions**:
- Minimum 44px tap targets
- Swipe to switch between pets (if multiple)
- Pull-down to refresh pet state
- Long-press for quick actions

**Offline Support**:
- Cached pet state
- Queue actions when offline
- Sync on reconnect

**App-Like Feel**:
- No visible URL bar (standalone mode)
- Custom splash screen with pet mascot
- Install prompt after 2-3 visits
- Persistent bottom navigation

## Accessibility

- High contrast between text and backgrounds
- Icons paired with text labels
- Clear focus states for keyboard navigation
- Screen reader friendly stat updates
- Reduced motion option for animations

## Sound Design (UI Notes)

- Soft chirp on pet tap
- Gentle chime for stat increases
- Calm background music (user-controlled)
- Satisfying "pop" for button presses
- Relaxing ambience in idle mode

## Data Visualization

**Stats**: Circular progress or horizontal bars
**Growth Chart**: Line graph showing pet development over time
**Collection**: Grid with completion percentage

This design creates a delightful, stress-free virtual pet experience optimized for daily mobile engagement with smooth animations and rewarding interactions.
