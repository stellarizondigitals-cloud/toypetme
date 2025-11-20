import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User profile with currency and authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"), // Nullable for Google OAuth users
  verified: boolean("verified").notNull().default(false),
  authType: text("auth_type").notNull().default("local"), // "local" or "google"
  verificationToken: text("verification_token"),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  coins: integer("coins").notNull().default(100),
  gems: integer("gems").notNull().default(0),
  premium: boolean("premium").notNull().default(false),
  dailyStreak: integer("daily_streak").notNull().default(0),
  lastDailyReward: timestamp("last_daily_reward"),
  adsWatchedToday: integer("ads_watched_today").notNull().default(0),
  lastAdDate: timestamp("last_ad_date"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Pet data
export const pets = pgTable("pets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull().default("Fluffy"), // Pet species/type
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  hunger: integer("hunger").notNull().default(100),
  happiness: integer("happiness").notNull().default(100),
  energy: integer("energy").notNull().default(100),
  cleanliness: integer("cleanliness").notNull().default(100),
  health: integer("health").notNull().default(100),
  age: integer("age").notNull().default(0), // Age in days
  evolutionStage: integer("evolution_stage").notNull().default(0), // 0=baby, 1=child, 2=teen, 3=adult
  mood: text("mood").notNull().default("happy"),
  isSick: boolean("is_sick").notNull().default(false),
  lastFed: timestamp("last_fed").default(sql`now()`),
  lastPlayed: timestamp("last_played").default(sql`now()`),
  lastCleaned: timestamp("last_cleaned").default(sql`now()`),
  lastHungerDecay: timestamp("last_hunger_decay").notNull().default(sql`now()`),
  lastHappinessDecay: timestamp("last_happiness_decay").notNull().default(sql`now()`),
  lastCleanlinessDecay: timestamp("last_cleanliness_decay").notNull().default(sql`now()`),
  lastHealthDecay: timestamp("last_health_decay").notNull().default(sql`now()`),
  lastUpdated: timestamp("last_updated").notNull().default(sql`now()`),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
}, (table) => ({
  userIdIdx: index("pets_user_id_idx").on(table.userId),
}));

// Shop items
export const shopItems = pgTable("shop_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "food", "toy", "decoration"
  price: integer("price").notNull(),
  effect: text("effect").notNull(), // JSON string: {"hunger": 20, "happiness": 10}
  image: text("image"),
});

// User inventory
export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  itemId: varchar("item_id").notNull().references(() => shopItems.id),
  quantity: integer("quantity").notNull().default(1),
});

// Challenges - predefined challenge types
export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "feed", "play", "clean", "sleep", "happiness", "health", "energy"
  target: integer("target").notNull(), // Number of times or target value
  coinReward: integer("coin_reward").notNull(), // 50-100 coins
  xpReward: integer("xp_reward").notNull(), // XP reward
});

// User daily challenges
export const userChallenges = pgTable("user_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  challengeId: varchar("challenge_id").notNull().references(() => challenges.id),
  progress: integer("progress").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  claimed: boolean("claimed").notNull().default(false), // Whether reward has been claimed
  assignedDate: timestamp("assigned_date").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"),
  claimedAt: timestamp("claimed_at"),
}, (table) => ({
  userIdIdx: index("user_challenges_user_id_idx").on(table.userId),
  assignedDateIdx: index("user_challenges_assigned_date_idx").on(table.assignedDate),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  passwordHash: true,
});

// Auth schemas
export const signupSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const requestResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const insertPetSchema = createInsertSchema(pets).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

// Schema for creating a pet via API (client only provides name and type)
export const createPetRequestSchema = z.object({
  name: z.string().min(1, "Pet name is required").max(50, "Pet name must be less than 50 characters"),
  type: z.string().optional(),
});

export const insertShopItemSchema = createInsertSchema(shopItems).omit({
  id: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
});

export const insertChallengeSchema = createInsertSchema(challenges);

export const insertUserChallengeSchema = createInsertSchema(userChallenges).omit({
  id: true,
  assignedDate: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SignupData = z.infer<typeof signupSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RequestResetData = z.infer<typeof requestResetSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export type InsertPet = z.infer<typeof insertPetSchema>;
export type Pet = typeof pets.$inferSelect;
export type CreatePetRequest = z.infer<typeof createPetRequestSchema>;

export type InsertShopItem = z.infer<typeof insertShopItemSchema>;
export type ShopItem = typeof shopItems.$inferSelect;

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;
export type UserChallenge = typeof userChallenges.$inferSelect;

// Daily login bonus and coin cap
export const DAILY_LOGIN_BONUS = 50;
export const MAX_COINS = 5000; // Prevent infinite hoarding

// Predefined shop items (consumable, single-use)
export const SHOP_ITEMS = [
  // Food items ($10-50) - Consumable, disappear after use
  {
    id: "food-apple",
    name: "Crispy Apple",
    description: "A fresh, juicy apple that restores hunger (single use)",
    category: "food",
    price: 10,
    effect: JSON.stringify({ hunger: 15 }),
    image: "apple",
  },
  {
    id: "food-burger",
    name: "Deluxe Burger",
    description: "A hearty burger that satisfies hunger (single use)",
    category: "food",
    price: 25,
    effect: JSON.stringify({ hunger: 30 }),
    image: "burger",
  },
  {
    id: "food-sushi",
    name: "Premium Sushi",
    description: "Exquisite sushi that fully restores hunger (single use)",
    category: "food",
    price: 50,
    effect: JSON.stringify({ hunger: 50 }),
    image: "sushi",
  },
  // Toys ($30-100) - Consumable, provide temporary happiness boost
  {
    id: "toy-ball",
    name: "Bouncy Ball",
    description: "A fun ball that increases happiness (single use)",
    category: "toy",
    price: 30,
    effect: JSON.stringify({ happiness: 20 }),
    image: "ball",
  },
  {
    id: "toy-robot",
    name: "Robot Companion",
    description: "An entertaining robot that boosts happiness (single use)",
    category: "toy",
    price: 60,
    effect: JSON.stringify({ happiness: 35 }),
    image: "robot",
  },
  {
    id: "toy-castle",
    name: "Play Castle",
    description: "A magnificent castle that maximizes happiness (single use)",
    category: "toy",
    price: 100,
    effect: JSON.stringify({ happiness: 50 }),
    image: "castle",
  },
  // Cosmetics ($100-500) - Consumable, provide stat boosts
  {
    id: "cosmetic-hat",
    name: "Fancy Hat",
    description: "A stylish hat that boosts happiness (single use)",
    category: "cosmetic",
    price: 100,
    effect: JSON.stringify({ happiness: 10 }),
    image: "hat",
  },
  {
    id: "cosmetic-crown",
    name: "Royal Crown",
    description: "A majestic crown that boosts happiness (single use)",
    category: "cosmetic",
    price: 250,
    effect: JSON.stringify({ happiness: 25 }),
    image: "crown",
  },
  {
    id: "cosmetic-sparkles",
    name: "Sparkle Effect",
    description: "A magical effect that boosts stats (single use)",
    category: "cosmetic",
    price: 500,
    effect: JSON.stringify({ happiness: 50, energy: 25 }),
    image: "sparkles",
  },
] as const;

// Pet action configuration
export const PET_ACTIONS = {
  feed: {
    statIncrease: { hunger: 20 },
    coinReward: 5,
    cooldownMinutes: 5,
    xpReward: 5,
  },
  play: {
    statIncrease: { happiness: 15, energy: -10 },
    coinReward: 10, // Higher reward for higher XP and energy cost
    cooldownMinutes: 5,
    xpReward: 10,
  },
  clean: {
    statIncrease: { cleanliness: 25 },
    coinReward: 8,
    cooldownMinutes: 5,
    xpReward: 8,
  },
  sleep: {
    statIncrease: { energy: 30 },
    coinReward: 5,
    cooldownMinutes: 5,
    xpReward: 5,
  },
} as const;

export type PetActionType = keyof typeof PET_ACTIONS;

// Level and evolution configuration
export const XP_PER_LEVEL = 100;
export const EVOLUTION_THRESHOLDS = {
  child: 5,   // Stage 0 → 1 at level 5
  teen: 10,   // Stage 1 → 2 at level 10
  adult: 20,  // Stage 2 → 3 at level 20
} as const;

export const EVOLUTION_STAGES = {
  0: "Baby",
  1: "Child", 
  2: "Teen",
  3: "Adult",
} as const;

// Calculate level and evolution progression from XP gain
export function calculateLevelAndEvolution(
  currentLevel: number,
  currentXP: number,
  currentStage: number,
  xpGain: number
): {
  newLevel: number;
  newXP: number;
  newStage: number;
  leveledUp: boolean;
  evolved: boolean;
} {
  let level = currentLevel;
  let xp = currentXP + xpGain;
  let stage = currentStage;
  const oldLevel = currentLevel;
  const oldStage = currentStage;
  
  // Constant XP_PER_LEVEL threshold
  while (xp >= XP_PER_LEVEL) {
    level++;
    xp -= XP_PER_LEVEL;
  }
  
  // Evolution thresholds (check in descending order to get highest stage)
  if (level >= EVOLUTION_THRESHOLDS.adult && stage < 3) {
    stage = 3; // Adult
  } else if (level >= EVOLUTION_THRESHOLDS.teen && stage < 2) {
    stage = 2; // Teen
  } else if (level >= EVOLUTION_THRESHOLDS.child && stage < 1) {
    stage = 1; // Child
  }
  
  return {
    newLevel: level,
    newXP: xp,
    newStage: stage,
    leveledUp: level > oldLevel,
    evolved: stage > oldStage,
  };
}

// Predefined daily challenges
export const DAILY_CHALLENGES: Challenge[] = [
  // Action-based challenges (feed, play, clean, sleep)
  {
    id: "feed-5",
    name: "Hungry Pet",
    description: "Feed your pet 5 times",
    type: "feed",
    target: 5,
    coinReward: 75,
    xpReward: 50,
  },
  {
    id: "play-10",
    name: "Playtime Champion",
    description: "Play with your pet 10 times",
    type: "play",
    target: 10,
    coinReward: 100,
    xpReward: 75,
  },
  {
    id: "clean-5",
    name: "Sparkling Clean",
    description: "Clean your pet 5 times",
    type: "clean",
    target: 5,
    coinReward: 75,
    xpReward: 50,
  },
  {
    id: "sleep-3",
    name: "Rest Time",
    description: "Let your pet sleep 3 times",
    type: "sleep",
    target: 3,
    coinReward: 60,
    xpReward: 40,
  },
  // Stat-based challenges (reach certain stat levels)
  {
    id: "happiness-100",
    name: "Pure Joy",
    description: "Reach 100 happiness with your pet",
    type: "happiness",
    target: 100,
    coinReward: 80,
    xpReward: 60,
  },
  {
    id: "health-100",
    name: "Peak Health",
    description: "Reach 100 health with your pet",
    type: "health",
    target: 100,
    coinReward: 80,
    xpReward: 60,
  },
  {
    id: "energy-100",
    name: "Energetic",
    description: "Reach 100 energy with your pet",
    type: "energy",
    target: 100,
    coinReward: 70,
    xpReward: 50,
  },
  // Combination challenges
  {
    id: "feed-3",
    name: "Daily Feeding",
    description: "Feed your pet 3 times",
    type: "feed",
    target: 3,
    coinReward: 50,
    xpReward: 30,
  },
  {
    id: "play-5",
    name: "Fun Time",
    description: "Play with your pet 5 times",
    type: "play",
    target: 5,
    coinReward: 60,
    xpReward: 40,
  },
];

// Stat decay configuration
export const STAT_DECAY = {
  hunger: {
    decayRate: 1, // Points per interval
    intervalMinutes: 30,
  },
  happiness: {
    decayRate: 1,
    intervalMinutes: 60,
  },
  cleanliness: {
    decayRate: 1,
    intervalMinutes: 120,
  },
  health: {
    decayRate: 1, // Only decays when other stats are at 0
    intervalMinutes: 60,
  },
} as const;

// Calculate stat decay based on time elapsed (using per-stat timestamps)
export function calculateStatDecay(pet: Pet, now: Date = new Date()): {
  hunger: number;
  happiness: number;
  cleanliness: number;
  health: number;
  isSick: boolean;
  newLastHungerDecay: Date;
  newLastHappinessDecay: Date;
  newLastCleanlinessDecay: Date;
  newLastHealthDecay: Date;
} {
  // Calculate elapsed time for each stat independently
  const hungerElapsed = Math.floor((now.getTime() - new Date(pet.lastHungerDecay).getTime()) / 1000 / 60);
  const happinessElapsed = Math.floor((now.getTime() - new Date(pet.lastHappinessDecay).getTime()) / 1000 / 60);
  const cleanlinessElapsed = Math.floor((now.getTime() - new Date(pet.lastCleanlinessDecay).getTime()) / 1000 / 60);
  const healthElapsed = Math.floor((now.getTime() - new Date(pet.lastHealthDecay).getTime()) / 1000 / 60);

  // Calculate intervals for each stat
  const hungerIntervals = hungerElapsed >= 0 ? Math.floor(hungerElapsed / STAT_DECAY.hunger.intervalMinutes) : 0;
  const happinessIntervals = happinessElapsed >= 0 ? Math.floor(happinessElapsed / STAT_DECAY.happiness.intervalMinutes) : 0;
  const cleanlinessIntervals = cleanlinessElapsed >= 0 ? Math.floor(cleanlinessElapsed / STAT_DECAY.cleanliness.intervalMinutes) : 0;

  // Check if pet was sick BEFORE applying decay (has any zero stat)
  const wasSick = pet.hunger === 0 || pet.happiness === 0 || pet.cleanliness === 0;

  // Apply decay (can't go below 0)
  const newHunger = Math.max(0, pet.hunger - (hungerIntervals * STAT_DECAY.hunger.decayRate));
  const newHappiness = Math.max(0, pet.happiness - (happinessIntervals * STAT_DECAY.happiness.decayRate));
  const newCleanliness = Math.max(0, pet.cleanliness - (cleanlinessIntervals * STAT_DECAY.cleanliness.decayRate));

  // Check if pet is sick AFTER applying decay
  const isNowSick = newHunger === 0 || newHappiness === 0 || newCleanliness === 0;
  let newHealth = pet.health;

  // Health decay logic:
  // - If was NOT sick and is NOW sick: Don't decay health yet (just became sick, start timer)
  // - If WAS sick and is STILL sick: Decay health based on elapsed time
  // - If is NOT sick: Health doesn't decay
  if (isNowSick && wasSick && healthElapsed >= 0) {
    // Pet was sick before and is still sick - apply health decay
    const healthIntervals = Math.floor(healthElapsed / STAT_DECAY.health.intervalMinutes);
    newHealth = Math.max(0, pet.health - (healthIntervals * STAT_DECAY.health.decayRate));
  }

  // Pet becomes sick when health reaches 0
  const isSick = newHealth === 0;

  // Advance each stat's timestamp by consumed intervals only
  const newLastHungerDecay = hungerIntervals > 0
    ? new Date(new Date(pet.lastHungerDecay).getTime() + hungerIntervals * STAT_DECAY.hunger.intervalMinutes * 60 * 1000)
    : new Date(pet.lastHungerDecay);

  const newLastHappinessDecay = happinessIntervals > 0
    ? new Date(new Date(pet.lastHappinessDecay).getTime() + happinessIntervals * STAT_DECAY.happiness.intervalMinutes * 60 * 1000)
    : new Date(pet.lastHappinessDecay);

  const newLastCleanlinessDecay = cleanlinessIntervals > 0
    ? new Date(new Date(pet.lastCleanlinessDecay).getTime() + cleanlinessIntervals * STAT_DECAY.cleanliness.intervalMinutes * 60 * 1000)
    : new Date(pet.lastCleanlinessDecay);

  // Health decay timestamp logic:
  // - If pet is NOW sick but WASN'T sick before: Reset to now (start counting from when became sick)
  // - If pet WAS sick and is STILL sick: Advance by consumed intervals
  // - If pet is NOT sick: Reset to now (clear the timer)
  let newLastHealthDecay: Date;
  if (isNowSick) {
    if (!wasSick) {
      // Just became sick - reset timer to now (start counting from this moment)
      newLastHealthDecay = now;
    } else {
      // Was sick and still sick - advance by consumed intervals
      const healthIntervals = Math.floor(healthElapsed / STAT_DECAY.health.intervalMinutes);
      newLastHealthDecay = healthIntervals > 0
        ? new Date(new Date(pet.lastHealthDecay).getTime() + healthIntervals * STAT_DECAY.health.intervalMinutes * 60 * 1000)
        : new Date(pet.lastHealthDecay);
    }
  } else {
    // Pet is healthy - reset timer to now
    newLastHealthDecay = now;
  }

  return {
    hunger: newHunger,
    happiness: newHappiness,
    cleanliness: newCleanliness,
    health: newHealth,
    isSick,
    newLastHungerDecay,
    newLastHappinessDecay,
    newLastCleanlinessDecay,
    newLastHealthDecay,
  };
}
