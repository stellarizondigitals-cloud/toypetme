// server/index.ts
import express2 from "express";
import session from "express-session";
import memorystore from "memorystore";
import pgSession from "connect-pg-simple";
import passport3 from "passport";

// server/passport.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  // Nullable for Google OAuth users
  verified: boolean("verified").notNull().default(false),
  authType: text("auth_type").notNull().default("local"),
  // "local" or "google"
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
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  notifyHunger: boolean("notify_hunger").notNull().default(true),
  notifyHappiness: boolean("notify_happiness").notNull().default(true),
  notifyChallenges: boolean("notify_challenges").notNull().default(true),
  notifyEvolution: boolean("notify_evolution").notNull().default(true),
  tutorialCompleted: boolean("tutorial_completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var pets = pgTable("pets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull().default("Fluffy"),
  // Pet species/type
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  hunger: integer("hunger").notNull().default(100),
  happiness: integer("happiness").notNull().default(100),
  energy: integer("energy").notNull().default(100),
  cleanliness: integer("cleanliness").notNull().default(100),
  health: integer("health").notNull().default(100),
  age: integer("age").notNull().default(0),
  // Age in days
  evolutionStage: integer("evolution_stage").notNull().default(0),
  // 0=baby, 1=child, 2=teen, 3=adult
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
  // Genetic traits for breeding
  color: text("color").notNull().default("brown"),
  // Primary color: brown, white, black, gray, golden, pink, blue, purple
  pattern: text("pattern").notNull().default("solid"),
  // Pattern: solid, spots, stripes, patches, gradient
  isMutation: boolean("is_mutation").notNull().default(false),
  // Special mutation flag
  parent1Id: varchar("parent1_id"),
  // Parent 1 reference (nullable for non-bred pets)
  parent2Id: varchar("parent2_id")
  // Parent 2 reference (nullable for non-bred pets)
}, (table) => ({
  userIdIdx: index("pets_user_id_idx").on(table.userId)
}));
var shopItems = pgTable("shop_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  // "food", "toy", "decoration"
  price: integer("price").notNull(),
  effect: text("effect").notNull(),
  // JSON string: {"hunger": 20, "happiness": 10}
  image: text("image")
});
var inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  itemId: varchar("item_id").notNull().references(() => shopItems.id),
  quantity: integer("quantity").notNull().default(1)
});
var challenges = pgTable("challenges", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  // "feed", "play", "clean", "sleep", "happiness", "health", "energy"
  target: integer("target").notNull(),
  // Number of times or target value
  coinReward: integer("coin_reward").notNull(),
  // 50-100 coins
  xpReward: integer("xp_reward").notNull()
  // XP reward
});
var userChallenges = pgTable("user_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  challengeId: varchar("challenge_id").notNull().references(() => challenges.id),
  progress: integer("progress").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  claimed: boolean("claimed").notNull().default(false),
  // Whether reward has been claimed
  assignedDate: timestamp("assigned_date").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"),
  claimedAt: timestamp("claimed_at")
}, (table) => ({
  userIdIdx: index("user_challenges_user_id_idx").on(table.userId),
  assignedDateIdx: index("user_challenges_assigned_date_idx").on(table.assignedDate)
}));
var breedingRecords = pgTable("breeding_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  parent1Id: varchar("parent1_id").notNull().references(() => pets.id),
  parent2Id: varchar("parent2_id").notNull().references(() => pets.id),
  status: text("status").notNull().default("incubating"),
  // "incubating", "ready", "hatched"
  paidWithCoins: boolean("paid_with_coins").notNull().default(true),
  // true if paid with coins, false if paid with money
  startedAt: timestamp("started_at").notNull().default(sql`now()`),
  readyAt: timestamp("ready_at").notNull(),
  // 24 hours after startedAt (or instant if premium)
  hatchedAt: timestamp("hatched_at"),
  eggId: varchar("egg_id")
  // Reference to the egg once created
}, (table) => ({
  userIdIdx: index("breeding_records_user_id_idx").on(table.userId),
  statusIdx: index("breeding_records_status_idx").on(table.status)
}));
var eggs = pgTable("eggs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  breedingRecordId: varchar("breeding_record_id").notNull().references(() => breedingRecords.id),
  name: text("name").notNull(),
  // Pre-generated name (user can rename after hatching)
  type: text("type").notNull(),
  // Inherited from parents
  color: text("color").notNull(),
  // Inherited/mutated color
  pattern: text("pattern").notNull(),
  // Inherited/mutated pattern
  isMutation: boolean("is_mutation").notNull().default(false),
  // Special mutation
  parent1Id: varchar("parent1_id").notNull(),
  // Parent 1 reference
  parent2Id: varchar("parent2_id").notNull(),
  // Parent 2 reference
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
}, (table) => ({
  userIdIdx: index("eggs_user_id_idx").on(table.userId)
}));
var miniGames = pgTable("mini_games", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  minCoins: integer("min_coins").notNull().default(20),
  // Minimum coin reward
  maxCoins: integer("max_coins").notNull().default(50),
  // Maximum coin reward
  cooldownMinutes: integer("cooldown_minutes").notNull().default(60)
  // Cooldown in minutes
});
var userMiniGameSessions = pgTable("user_mini_game_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").notNull().references(() => miniGames.id),
  score: integer("score").notNull(),
  coinsEarned: integer("coins_earned").notNull(),
  playedAt: timestamp("played_at").notNull().default(sql`now()`)
}, (table) => ({
  userIdIdx: index("user_mini_game_sessions_user_id_idx").on(table.userId),
  gameIdIdx: index("user_mini_game_sessions_game_id_idx").on(table.gameId),
  playedAtIdx: index("user_mini_game_sessions_played_at_idx").on(table.playedAt)
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  passwordHash: true
});
var signupSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});
var loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});
var requestResetSchema = z.object({
  email: z.string().email("Invalid email address")
});
var resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters")
});
var insertPetSchema = createInsertSchema(pets).omit({
  id: true,
  lastUpdated: true,
  createdAt: true
});
var createPetRequestSchema = z.object({
  name: z.string().min(1, "Pet name is required").max(50, "Pet name must be less than 50 characters"),
  type: z.string().optional()
});
var insertShopItemSchema = createInsertSchema(shopItems).omit({
  id: true
});
var insertInventorySchema = createInsertSchema(inventory).omit({
  id: true
});
var insertChallengeSchema = createInsertSchema(challenges);
var insertUserChallengeSchema = createInsertSchema(userChallenges).omit({
  id: true,
  assignedDate: true
});
var insertBreedingRecordSchema = createInsertSchema(breedingRecords).omit({
  id: true,
  startedAt: true,
  hatchedAt: true,
  eggId: true
});
var insertEggSchema = createInsertSchema(eggs).omit({
  id: true,
  createdAt: true
});
var insertMiniGameSchema = createInsertSchema(miniGames);
var insertUserMiniGameSessionSchema = createInsertSchema(userMiniGameSessions).omit({
  id: true,
  playedAt: true
});
var startBreedingSchema = z.object({
  parent1Id: z.string().min(1, "Parent 1 ID is required"),
  parent2Id: z.string().min(1, "Parent 2 ID is required"),
  payWithMoney: z.boolean().default(false)
  // true for £0.99, false for 200 coins
});
var BREEDING_COST_COINS = 200;
var BREEDING_DURATION_HOURS = 24;
var MUTATION_CHANCE = 0.05;
var PET_COLORS = ["brown", "white", "black", "gray", "golden", "pink", "blue", "purple"];
var PET_PATTERNS = ["solid", "spots", "stripes", "patches", "gradient"];
var MUTATION_COLORS = ["rainbow", "starry", "crystal", "shadow"];
var MUTATION_PATTERNS = ["sparkles", "swirls", "cosmic", "flame"];
var MINI_GAMES = [
  {
    id: "memory-match",
    name: "Memory Match",
    description: "Match pairs of cards to test your memory and earn coins!",
    minCoins: 20,
    maxCoins: 50,
    cooldownMinutes: 60
    // 1 hour cooldown
  },
  {
    id: "reaction-time",
    name: "Reaction Time",
    description: "Tap when the color changes! Test your reflexes for rewards.",
    minCoins: 20,
    maxCoins: 50,
    cooldownMinutes: 60
    // 1 hour cooldown
  },
  {
    id: "feed-frenzy",
    name: "Feed Frenzy",
    description: "Catch falling food items to feed your hungry pet and earn coins!",
    minCoins: 20,
    maxCoins: 50,
    cooldownMinutes: 60
    // 1 hour cooldown
  }
];
var DAILY_LOGIN_BONUS = 50;
var MAX_COINS = 5e3;
var SHOP_ITEMS = [
  // Food items ($10-50) - Consumable, disappear after use
  {
    id: "food-apple",
    name: "Crispy Apple",
    description: "A fresh, juicy apple that restores hunger (single use)",
    category: "food",
    price: 10,
    effect: JSON.stringify({ hunger: 15 }),
    image: "apple"
  },
  {
    id: "food-burger",
    name: "Deluxe Burger",
    description: "A hearty burger that satisfies hunger (single use)",
    category: "food",
    price: 25,
    effect: JSON.stringify({ hunger: 30 }),
    image: "burger"
  },
  {
    id: "food-sushi",
    name: "Premium Sushi",
    description: "Exquisite sushi that fully restores hunger (single use)",
    category: "food",
    price: 50,
    effect: JSON.stringify({ hunger: 50 }),
    image: "sushi"
  },
  // Toys ($30-100) - Consumable, provide temporary happiness boost
  {
    id: "toy-ball",
    name: "Bouncy Ball",
    description: "A fun ball that increases happiness (single use)",
    category: "toy",
    price: 30,
    effect: JSON.stringify({ happiness: 20 }),
    image: "ball"
  },
  {
    id: "toy-robot",
    name: "Robot Companion",
    description: "An entertaining robot that boosts happiness (single use)",
    category: "toy",
    price: 60,
    effect: JSON.stringify({ happiness: 35 }),
    image: "robot"
  },
  {
    id: "toy-castle",
    name: "Play Castle",
    description: "A magnificent castle that maximizes happiness (single use)",
    category: "toy",
    price: 100,
    effect: JSON.stringify({ happiness: 50 }),
    image: "castle"
  },
  // Cosmetics ($100-500) - Consumable, provide stat boosts
  {
    id: "cosmetic-hat",
    name: "Fancy Hat",
    description: "A stylish hat that boosts happiness (single use)",
    category: "cosmetic",
    price: 100,
    effect: JSON.stringify({ happiness: 10 }),
    image: "hat"
  },
  {
    id: "cosmetic-crown",
    name: "Royal Crown",
    description: "A majestic crown that boosts happiness (single use)",
    category: "cosmetic",
    price: 250,
    effect: JSON.stringify({ happiness: 25 }),
    image: "crown"
  },
  {
    id: "cosmetic-sparkles",
    name: "Sparkle Effect",
    description: "A magical effect that boosts stats (single use)",
    category: "cosmetic",
    price: 500,
    effect: JSON.stringify({ happiness: 50, energy: 25 }),
    image: "sparkles"
  }
];
var PET_ACTIONS = {
  feed: {
    statIncrease: { hunger: 20 },
    coinReward: 5,
    cooldownMinutes: 5,
    xpReward: 5
  },
  play: {
    statIncrease: { happiness: 15, energy: -10 },
    coinReward: 10,
    // Higher reward for higher XP and energy cost
    cooldownMinutes: 5,
    xpReward: 10
  },
  clean: {
    statIncrease: { cleanliness: 25 },
    coinReward: 8,
    cooldownMinutes: 5,
    xpReward: 8
  },
  sleep: {
    statIncrease: { energy: 30 },
    coinReward: 5,
    cooldownMinutes: 5,
    xpReward: 5
  }
};
var XP_PER_LEVEL = 100;
var EVOLUTION_THRESHOLDS = {
  child: 5,
  // Stage 0 → 1 at level 5
  teen: 10,
  // Stage 1 → 2 at level 10
  adult: 20
  // Stage 2 → 3 at level 20
};
function calculateLevelAndEvolution(currentLevel, currentXP, currentStage, xpGain) {
  let level = currentLevel;
  let xp = currentXP + xpGain;
  let stage = currentStage;
  const oldLevel = currentLevel;
  const oldStage = currentStage;
  while (xp >= XP_PER_LEVEL) {
    level++;
    xp -= XP_PER_LEVEL;
  }
  if (level >= EVOLUTION_THRESHOLDS.adult && stage < 3) {
    stage = 3;
  } else if (level >= EVOLUTION_THRESHOLDS.teen && stage < 2) {
    stage = 2;
  } else if (level >= EVOLUTION_THRESHOLDS.child && stage < 1) {
    stage = 1;
  }
  return {
    newLevel: level,
    newXP: xp,
    newStage: stage,
    leveledUp: level > oldLevel,
    evolved: stage > oldStage
  };
}
var DAILY_CHALLENGES = [
  // Action-based challenges (feed, play, clean, sleep)
  {
    id: "feed-5",
    name: "Hungry Pet",
    description: "Feed your pet 5 times",
    type: "feed",
    target: 5,
    coinReward: 75,
    xpReward: 50
  },
  {
    id: "play-10",
    name: "Playtime Champion",
    description: "Play with your pet 10 times",
    type: "play",
    target: 10,
    coinReward: 100,
    xpReward: 75
  },
  {
    id: "clean-5",
    name: "Sparkling Clean",
    description: "Clean your pet 5 times",
    type: "clean",
    target: 5,
    coinReward: 75,
    xpReward: 50
  },
  {
    id: "sleep-3",
    name: "Rest Time",
    description: "Let your pet sleep 3 times",
    type: "sleep",
    target: 3,
    coinReward: 60,
    xpReward: 40
  },
  // Stat-based challenges (reach certain stat levels)
  {
    id: "happiness-100",
    name: "Pure Joy",
    description: "Reach 100 happiness with your pet",
    type: "happiness",
    target: 100,
    coinReward: 80,
    xpReward: 60
  },
  {
    id: "health-100",
    name: "Peak Health",
    description: "Reach 100 health with your pet",
    type: "health",
    target: 100,
    coinReward: 80,
    xpReward: 60
  },
  {
    id: "energy-100",
    name: "Energetic",
    description: "Reach 100 energy with your pet",
    type: "energy",
    target: 100,
    coinReward: 70,
    xpReward: 50
  },
  // Combination challenges
  {
    id: "feed-3",
    name: "Daily Feeding",
    description: "Feed your pet 3 times",
    type: "feed",
    target: 3,
    coinReward: 50,
    xpReward: 30
  },
  {
    id: "play-5",
    name: "Fun Time",
    description: "Play with your pet 5 times",
    type: "play",
    target: 5,
    coinReward: 60,
    xpReward: 40
  }
];
var STAT_DECAY = {
  hunger: {
    decayRate: 1,
    // Points per interval
    intervalMinutes: 30
  },
  happiness: {
    decayRate: 1,
    intervalMinutes: 60
  },
  cleanliness: {
    decayRate: 1,
    intervalMinutes: 120
  },
  health: {
    decayRate: 1,
    // Only decays when other stats are at 0
    intervalMinutes: 60
  }
};
function calculateStatDecay(pet, now = /* @__PURE__ */ new Date()) {
  const hungerElapsed = Math.floor((now.getTime() - new Date(pet.lastHungerDecay).getTime()) / 1e3 / 60);
  const happinessElapsed = Math.floor((now.getTime() - new Date(pet.lastHappinessDecay).getTime()) / 1e3 / 60);
  const cleanlinessElapsed = Math.floor((now.getTime() - new Date(pet.lastCleanlinessDecay).getTime()) / 1e3 / 60);
  const healthElapsed = Math.floor((now.getTime() - new Date(pet.lastHealthDecay).getTime()) / 1e3 / 60);
  const hungerIntervals = hungerElapsed >= 0 ? Math.floor(hungerElapsed / STAT_DECAY.hunger.intervalMinutes) : 0;
  const happinessIntervals = happinessElapsed >= 0 ? Math.floor(happinessElapsed / STAT_DECAY.happiness.intervalMinutes) : 0;
  const cleanlinessIntervals = cleanlinessElapsed >= 0 ? Math.floor(cleanlinessElapsed / STAT_DECAY.cleanliness.intervalMinutes) : 0;
  const wasSick = pet.hunger === 0 || pet.happiness === 0 || pet.cleanliness === 0;
  const newHunger = Math.max(0, pet.hunger - hungerIntervals * STAT_DECAY.hunger.decayRate);
  const newHappiness = Math.max(0, pet.happiness - happinessIntervals * STAT_DECAY.happiness.decayRate);
  const newCleanliness = Math.max(0, pet.cleanliness - cleanlinessIntervals * STAT_DECAY.cleanliness.decayRate);
  const isNowSick = newHunger === 0 || newHappiness === 0 || newCleanliness === 0;
  let newHealth = pet.health;
  if (isNowSick && wasSick && healthElapsed >= 0) {
    const healthIntervals = Math.floor(healthElapsed / STAT_DECAY.health.intervalMinutes);
    newHealth = Math.max(0, pet.health - healthIntervals * STAT_DECAY.health.decayRate);
  }
  const isSick = newHealth === 0;
  const newLastHungerDecay = hungerIntervals > 0 ? new Date(new Date(pet.lastHungerDecay).getTime() + hungerIntervals * STAT_DECAY.hunger.intervalMinutes * 60 * 1e3) : new Date(pet.lastHungerDecay);
  const newLastHappinessDecay = happinessIntervals > 0 ? new Date(new Date(pet.lastHappinessDecay).getTime() + happinessIntervals * STAT_DECAY.happiness.intervalMinutes * 60 * 1e3) : new Date(pet.lastHappinessDecay);
  const newLastCleanlinessDecay = cleanlinessIntervals > 0 ? new Date(new Date(pet.lastCleanlinessDecay).getTime() + cleanlinessIntervals * STAT_DECAY.cleanliness.intervalMinutes * 60 * 1e3) : new Date(pet.lastCleanlinessDecay);
  let newLastHealthDecay;
  if (isNowSick) {
    if (!wasSick) {
      newLastHealthDecay = now;
    } else {
      const healthIntervals = Math.floor(healthElapsed / STAT_DECAY.health.intervalMinutes);
      newLastHealthDecay = healthIntervals > 0 ? new Date(new Date(pet.lastHealthDecay).getTime() + healthIntervals * STAT_DECAY.health.intervalMinutes * 60 * 1e3) : new Date(pet.lastHealthDecay);
    }
  } else {
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
    newLastHealthDecay
  };
}

// server/storage.ts
import { randomUUID } from "crypto";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and, desc, sql as sqlOp, count, max, gte, lt } from "drizzle-orm";

// server/genetics.ts
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomParent(parent1, parent2) {
  return Math.random() < 0.5 ? parent1 : parent2;
}
function shouldMutate() {
  return Math.random() < MUTATION_CHANCE;
}
function inheritTraits(parent1, parent2) {
  const isMutation = shouldMutate();
  let color;
  let pattern;
  if (isMutation) {
    color = randomChoice(MUTATION_COLORS);
    pattern = randomChoice(MUTATION_PATTERNS);
  } else {
    color = randomParent(parent1.color, parent2.color);
    pattern = randomParent(parent1.pattern, parent2.pattern);
    if (Math.random() < 0.1) {
      color = randomChoice(PET_COLORS);
    }
    if (Math.random() < 0.1) {
      pattern = randomChoice(PET_PATTERNS);
    }
  }
  const type = randomParent(parent1.type, parent2.type);
  return {
    color,
    pattern,
    isMutation,
    type
  };
}
function generateRandomTraits() {
  return {
    color: randomChoice(PET_COLORS),
    pattern: randomChoice(PET_PATTERNS)
  };
}
function generateBabyName() {
  const prefixes = [
    "Tiny",
    "Baby",
    "Little",
    "Mini",
    "Sweet",
    "Cute",
    "Precious",
    "Lovely",
    "Fluffy",
    "Fuzzy",
    "Soft",
    "Snuggly"
  ];
  const suffixes = [
    "Bean",
    "Puff",
    "Star",
    "Moon",
    "Cloud",
    "Joy",
    "Love",
    "Heart",
    "Angel",
    "Bud",
    "Dot",
    "Pip"
  ];
  return `${randomChoice(prefixes)} ${randomChoice(suffixes)}`;
}

// server/storage.ts
var MemStorage = class {
  users;
  pets;
  shopItems;
  inventory;
  challenges;
  userChallenges;
  breedingRecords;
  eggs;
  miniGames;
  userMiniGameSessions;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.pets = /* @__PURE__ */ new Map();
    this.shopItems = /* @__PURE__ */ new Map();
    this.inventory = /* @__PURE__ */ new Map();
    this.challenges = /* @__PURE__ */ new Map();
    this.userChallenges = /* @__PURE__ */ new Map();
    this.breedingRecords = /* @__PURE__ */ new Map();
    this.eggs = /* @__PURE__ */ new Map();
    this.miniGames = /* @__PURE__ */ new Map();
    this.userMiniGameSessions = /* @__PURE__ */ new Map();
    this.initializeShopItems();
    this.initializeChallenges();
    this.initializeMiniGames();
  }
  initializeShopItems() {
    SHOP_ITEMS.forEach((item) => this.shopItems.set(item.id, item));
  }
  initializeChallenges() {
    DAILY_CHALLENGES.forEach((challenge) => this.challenges.set(challenge.id, challenge));
  }
  initializeMiniGames() {
    MINI_GAMES.forEach((game) => this.miniGames.set(game.id, game));
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  async getUserByVerificationToken(token) {
    return Array.from(this.users.values()).find(
      (user) => user.verificationToken === token
    );
  }
  async getUserByResetToken(token) {
    return Array.from(this.users.values()).find(
      (user) => user.resetToken === token
    );
  }
  async createUser(username, email, passwordHash, authType = "local") {
    const id = randomUUID();
    const user = {
      id,
      username,
      email,
      passwordHash,
      verified: authType === "google",
      // Google users are auto-verified
      authType,
      verificationToken: null,
      verificationTokenExpiry: null,
      resetToken: null,
      resetTokenExpiry: null,
      coins: 100,
      gems: 0,
      premium: false,
      dailyStreak: 0,
      lastDailyReward: null,
      adsWatchedToday: 0,
      lastAdDate: null,
      notificationsEnabled: true,
      notifyHunger: true,
      notifyHappiness: true,
      notifyChallenges: true,
      notifyEvolution: true,
      tutorialCompleted: false,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(id, user);
    return user;
  }
  async setVerificationToken(userId, token, expiry) {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    user.verificationToken = token;
    user.verificationTokenExpiry = expiry;
    this.users.set(userId, user);
    return user;
  }
  async verifyUser(userId) {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    user.verified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    this.users.set(userId, user);
    return user;
  }
  async setResetToken(userId, token, expiry) {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    this.users.set(userId, user);
    return user;
  }
  async resetPassword(userId, passwordHash) {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    user.passwordHash = passwordHash;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    this.users.set(userId, user);
    return user;
  }
  async updateUserAuthType(userId, authType) {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    user.authType = authType;
    this.users.set(userId, user);
    return user;
  }
  async markEmailVerified(userId) {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    user.verified = true;
    this.users.set(userId, user);
    return user;
  }
  async togglePremium(userId) {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    user.premium = !user.premium;
    this.users.set(userId, user);
    return user;
  }
  async watchAdBonus(userId) {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    if (user.premium) {
      throw new Error("Premium users cannot watch ads");
    }
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const lastAdDate = user.lastAdDate ? new Date(user.lastAdDate) : null;
    const shouldReset = !lastAdDate || lastAdDate < today;
    if (shouldReset) {
      user.adsWatchedToday = 0;
      user.lastAdDate = /* @__PURE__ */ new Date();
    }
    const MAX_ADS_PER_DAY = 5;
    if (user.adsWatchedToday >= MAX_ADS_PER_DAY) {
      throw new Error("Daily ad limit reached");
    }
    const AD_BONUS = 50;
    const newCoins = Math.min(user.coins + AD_BONUS, MAX_COINS);
    const coinsEarned = newCoins - user.coins;
    user.coins = newCoins;
    user.adsWatchedToday += 1;
    user.lastAdDate = /* @__PURE__ */ new Date();
    this.users.set(userId, user);
    const adsRemaining = MAX_ADS_PER_DAY - user.adsWatchedToday;
    return { user, coinsEarned, adsRemaining };
  }
  async updateNotificationPreferences(userId, preferences) {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    if (preferences.notificationsEnabled !== void 0) {
      user.notificationsEnabled = preferences.notificationsEnabled;
    }
    if (preferences.notifyHunger !== void 0) {
      user.notifyHunger = preferences.notifyHunger;
    }
    if (preferences.notifyHappiness !== void 0) {
      user.notifyHappiness = preferences.notifyHappiness;
    }
    if (preferences.notifyChallenges !== void 0) {
      user.notifyChallenges = preferences.notifyChallenges;
    }
    if (preferences.notifyEvolution !== void 0) {
      user.notifyEvolution = preferences.notifyEvolution;
    }
    this.users.set(userId, user);
    return user;
  }
  async completeTutorial(userId, starterPetName, starterPetType) {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    if (user.tutorialCompleted) {
      throw new Error("Tutorial already completed");
    }
    user.coins = Math.min(user.coins + 100, MAX_COINS);
    user.tutorialCompleted = true;
    this.users.set(userId, user);
    const pet = await this.createPet({
      userId,
      name: starterPetName,
      type: starterPetType
    });
    return { user, pet };
  }
  async skipTutorial(userId) {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    if (user.tutorialCompleted) {
      throw new Error("Tutorial already completed");
    }
    user.tutorialCompleted = true;
    this.users.set(userId, user);
    const pet = await this.createPet({
      userId,
      name: "Buddy",
      type: "Fluffy"
    });
    return { user, pet };
  }
  async updateUserCoins(userId, coins, gems) {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    user.coins = Math.min(coins, MAX_COINS);
    user.gems = gems;
    this.users.set(userId, user);
    return user;
  }
  async claimDailyReward(userId) {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const now = /* @__PURE__ */ new Date();
    const lastReward = user.lastDailyReward;
    if (lastReward) {
      const hoursSince = (now.getTime() - lastReward.getTime()) / (1e3 * 60 * 60);
      if (hoursSince >= 20 && hoursSince <= 48) {
        user.dailyStreak += 1;
      } else if (hoursSince > 48) {
        user.dailyStreak = 1;
      }
    } else {
      user.dailyStreak = 1;
    }
    const coinsEarned = DAILY_LOGIN_BONUS + user.dailyStreak * 10;
    user.coins = Math.min(user.coins + coinsEarned, MAX_COINS);
    user.lastDailyReward = now;
    this.users.set(userId, user);
    return user;
  }
  // Pet methods
  async getPet(id) {
    return this.pets.get(id);
  }
  async getPetByUserId(userId) {
    return Array.from(this.pets.values()).find((pet) => pet.userId === userId);
  }
  async getAllPetsByUserId(userId) {
    return Array.from(this.pets.values()).filter((pet) => pet.userId === userId);
  }
  async createPet(insertPet) {
    const id = randomUUID();
    const now = /* @__PURE__ */ new Date();
    const randomTraits = insertPet.color && insertPet.pattern ? { color: insertPet.color, pattern: insertPet.pattern } : generateRandomTraits();
    const pet = {
      id,
      userId: insertPet.userId,
      name: insertPet.name,
      type: insertPet.type ?? "Fluffy",
      level: insertPet.level ?? 1,
      xp: insertPet.xp ?? 0,
      hunger: insertPet.hunger ?? 100,
      happiness: insertPet.happiness ?? 100,
      energy: insertPet.energy ?? 100,
      cleanliness: insertPet.cleanliness ?? 100,
      health: insertPet.health ?? 100,
      age: insertPet.age ?? 0,
      evolutionStage: insertPet.evolutionStage ?? 1,
      mood: insertPet.mood ?? "happy",
      isSick: insertPet.isSick ?? false,
      lastFed: insertPet.lastFed ?? now,
      lastPlayed: insertPet.lastPlayed ?? now,
      lastCleaned: insertPet.lastCleaned ?? now,
      lastHungerDecay: insertPet.lastHungerDecay ?? now,
      lastHappinessDecay: insertPet.lastHappinessDecay ?? now,
      lastCleanlinessDecay: insertPet.lastCleanlinessDecay ?? now,
      lastHealthDecay: insertPet.lastHealthDecay ?? now,
      lastUpdated: now,
      createdAt: now,
      // Genetic traits (for breeding)
      color: insertPet.color ?? randomTraits.color,
      pattern: insertPet.pattern ?? randomTraits.pattern,
      isMutation: insertPet.isMutation ?? false,
      parent1Id: insertPet.parent1Id ?? null,
      parent2Id: insertPet.parent2Id ?? null
    };
    this.pets.set(id, pet);
    return pet;
  }
  async updatePetStats(petId, stats, timestamps) {
    const pet = this.pets.get(petId);
    if (!pet) throw new Error("Pet not found");
    if (stats.hunger !== void 0) pet.hunger = Math.max(0, Math.min(100, stats.hunger));
    if (stats.happiness !== void 0) pet.happiness = Math.max(0, Math.min(100, stats.happiness));
    if (stats.energy !== void 0) pet.energy = Math.max(0, Math.min(100, stats.energy));
    if (stats.cleanliness !== void 0) pet.cleanliness = Math.max(0, Math.min(100, stats.cleanliness));
    if (timestamps?.lastFed) pet.lastFed = timestamps.lastFed;
    if (timestamps?.lastPlayed) pet.lastPlayed = timestamps.lastPlayed;
    if (timestamps?.lastCleaned) pet.lastCleaned = timestamps.lastCleaned;
    pet.lastUpdated = /* @__PURE__ */ new Date();
    this.pets.set(petId, pet);
    return pet;
  }
  async updatePetMood(petId, mood) {
    const pet = this.pets.get(petId);
    if (!pet) throw new Error("Pet not found");
    pet.mood = mood;
    this.pets.set(petId, pet);
    return pet;
  }
  async addPetXP(petId, xpGain) {
    const pet = this.pets.get(petId);
    if (!pet) throw new Error("Pet not found");
    const result = calculateLevelAndEvolution(pet.level, pet.xp, pet.evolutionStage, xpGain);
    pet.level = result.newLevel;
    pet.xp = result.newXP;
    pet.evolutionStage = result.newStage;
    this.pets.set(petId, pet);
    return {
      pet,
      leveledUp: result.leveledUp,
      evolved: result.evolved
    };
  }
  async performPetAction(userId, petId, actionType) {
    const pet = this.pets.get(petId);
    if (!pet) throw new Error("Pet not found");
    if (pet.userId !== userId) throw new Error("Unauthorized");
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const action = PET_ACTIONS[actionType];
    if (!action) throw new Error("Invalid action type");
    const now = /* @__PURE__ */ new Date();
    const stats = {};
    const timestamps = {};
    for (const [stat, delta] of Object.entries(action.statIncrease)) {
      stats[stat] = pet[stat] + delta;
    }
    if (actionType === "feed") timestamps.lastFed = now;
    else if (actionType === "play") timestamps.lastPlayed = now;
    else if (actionType === "clean") timestamps.lastCleaned = now;
    let updatedPet = await this.updatePetStats(petId, stats, timestamps);
    const xpResult = await this.addPetXP(petId, action.xpReward);
    updatedPet = xpResult.pet;
    const updatedUser = await this.updateUserCoins(userId, user.coins + action.coinReward, user.gems);
    await this.updateChallengeProgress(userId, actionType, 1);
    if (updatedPet.happiness >= 0) {
      await this.updateChallengeProgress(userId, "happiness", updatedPet.happiness);
    }
    if (updatedPet.health >= 0) {
      await this.updateChallengeProgress(userId, "health", updatedPet.health);
    }
    if (updatedPet.energy >= 0) {
      await this.updateChallengeProgress(userId, "energy", updatedPet.energy);
    }
    const cooldowns = {
      feed: 0,
      play: 0,
      clean: 0,
      sleep: 0
    };
    const response = {
      pet: updatedPet,
      user: updatedUser,
      cooldowns
    };
    if (xpResult.leveledUp) {
      response.leveledUp = true;
      response.newLevel = updatedPet.level;
    }
    if (xpResult.evolved) {
      response.evolved = true;
      response.newStage = updatedPet.evolutionStage;
    }
    return response;
  }
  async applyStatDecay(petId) {
    const pet = this.pets.get(petId);
    if (!pet) throw new Error("Pet not found");
    const decayedStats = calculateStatDecay(pet);
    pet.hunger = decayedStats.hunger;
    pet.happiness = decayedStats.happiness;
    pet.cleanliness = decayedStats.cleanliness;
    pet.health = decayedStats.health;
    pet.isSick = decayedStats.isSick;
    pet.lastHungerDecay = decayedStats.newLastHungerDecay;
    pet.lastHappinessDecay = decayedStats.newLastHappinessDecay;
    pet.lastCleanlinessDecay = decayedStats.newLastCleanlinessDecay;
    pet.lastHealthDecay = decayedStats.newLastHealthDecay;
    this.pets.set(petId, pet);
    return pet;
  }
  // Shop & Inventory methods
  async getAllShopItems() {
    return Array.from(this.shopItems.values());
  }
  async getShopItem(id) {
    return this.shopItems.get(id);
  }
  async getUserInventory(userId) {
    return this.inventory.get(userId) || [];
  }
  async addToInventory(userId, itemId, quantity) {
    const userInv = this.inventory.get(userId) || [];
    const existing = userInv.find((inv) => inv.itemId === itemId);
    if (existing) {
      existing.quantity += quantity;
      this.inventory.set(userId, userInv);
      return existing;
    } else {
      const newInv = {
        id: randomUUID(),
        userId,
        itemId,
        quantity
      };
      userInv.push(newInv);
      this.inventory.set(userId, userInv);
      return newInv;
    }
  }
  async purchaseItem(userId, itemId) {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const item = this.shopItems.get(itemId);
    if (!item) throw new Error("Shop item not found");
    if (user.coins < item.price) {
      throw new Error("Insufficient coins");
    }
    const updatedUser = await this.updateUserCoins(userId, user.coins - item.price, user.gems);
    const inventoryItem = await this.addToInventory(userId, itemId, 1);
    return { user: updatedUser, inventory: inventoryItem };
  }
  async useInventoryItem(userId, itemId) {
    const userInv = this.inventory.get(userId) || [];
    const item = userInv.find((inv) => inv.itemId === itemId);
    if (!item || item.quantity <= 0) return void 0;
    item.quantity -= 1;
    if (item.quantity === 0) {
      const filtered = userInv.filter((inv) => inv.itemId !== itemId);
      this.inventory.set(userId, filtered);
    } else {
      this.inventory.set(userId, userInv);
    }
    return item;
  }
  // Leaderboard methods
  async getLeaderboardByHighestLevelPet(currentUserId) {
    const allPets = Array.from(this.pets.values());
    const userPetMap = /* @__PURE__ */ new Map();
    for (const pet of allPets) {
      const current = userPetMap.get(pet.userId);
      if (!current || pet.level > current.maxLevel) {
        userPetMap.set(pet.userId, { maxLevel: pet.level, petName: pet.name });
      }
    }
    const entries = Array.from(userPetMap.entries()).map(([userId, data]) => {
      const user = this.users.get(userId);
      return {
        userId,
        username: user?.username || "Unknown",
        maxLevel: data.maxLevel,
        petName: data.petName
      };
    });
    entries.sort((a, b) => b.maxLevel - a.maxLevel);
    const leaderboard = entries.slice(0, 50).map((entry, index2) => ({
      ...entry,
      rank: index2 + 1
    }));
    const currentUserIndex = entries.findIndex((e) => e.userId === currentUserId);
    const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : null;
    return { leaderboard, currentUserRank };
  }
  async getLeaderboardByMostPets(currentUserId) {
    const allPets = Array.from(this.pets.values());
    const userPetCount = /* @__PURE__ */ new Map();
    for (const pet of allPets) {
      const count2 = userPetCount.get(pet.userId) || 0;
      userPetCount.set(pet.userId, count2 + 1);
    }
    const entries = Array.from(userPetCount.entries()).map(([userId, petCount]) => {
      const user = this.users.get(userId);
      return {
        userId,
        username: user?.username || "Unknown",
        petCount
      };
    });
    entries.sort((a, b) => b.petCount - a.petCount);
    const leaderboard = entries.slice(0, 50).map((entry, index2) => ({
      ...entry,
      rank: index2 + 1
    }));
    const currentUserIndex = entries.findIndex((e) => e.userId === currentUserId);
    const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : null;
    return { leaderboard, currentUserRank };
  }
  async getLeaderboardByTotalCoins(currentUserId) {
    const allUsers = Array.from(this.users.values());
    const entries = allUsers.map((user) => ({
      userId: user.id,
      username: user.username,
      coins: user.coins
    }));
    entries.sort((a, b) => b.coins - a.coins);
    const leaderboard = entries.slice(0, 50).map((entry, index2) => ({
      ...entry,
      rank: index2 + 1
    }));
    const currentUserIndex = entries.findIndex((e) => e.userId === currentUserId);
    const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : null;
    return { leaderboard, currentUserRank };
  }
  // Daily Challenges
  async getDailyChallenges(userId) {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    let userDailyChallenges = this.userChallenges.get(userId) || [];
    const todaysChallenges = userDailyChallenges.filter((uc) => {
      const assignedDate = new Date(uc.assignedDate);
      assignedDate.setHours(0, 0, 0, 0);
      return assignedDate.getTime() === today.getTime();
    });
    if (todaysChallenges.length < 3) {
      const allChallengeIds = Array.from(this.challenges.keys());
      const existingIds = new Set(todaysChallenges.map((c) => c.challengeId));
      const availableIds = allChallengeIds.filter((id) => !existingIds.has(id));
      const shuffled = availableIds.sort(() => Math.random() - 0.5);
      const needed = 3 - todaysChallenges.length;
      const toAssign = shuffled.slice(0, needed);
      for (const challengeId of toAssign) {
        const newUserChallenge = {
          id: randomUUID(),
          userId,
          challengeId,
          progress: 0,
          completed: false,
          claimed: false,
          assignedDate: today,
          completedAt: null,
          claimedAt: null
        };
        todaysChallenges.push(newUserChallenge);
        userDailyChallenges.push(newUserChallenge);
      }
      this.userChallenges.set(userId, userDailyChallenges);
    }
    return todaysChallenges.map((uc) => {
      const challenge = this.challenges.get(uc.challengeId);
      return { ...uc, challenge };
    });
  }
  async updateChallengeProgress(userId, challengeType, incrementBy) {
    if (incrementBy < 0) {
      throw new Error("Challenge progress increment cannot be negative");
    }
    const userDailyChallenges = this.userChallenges.get(userId) || [];
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const relevantChallenges = userDailyChallenges.filter((uc) => {
      const challenge = this.challenges.get(uc.challengeId);
      if (!challenge || challenge.type !== challengeType) return false;
      const assignedDate = new Date(uc.assignedDate);
      assignedDate.setHours(0, 0, 0, 0);
      return assignedDate.getTime() === today.getTime() && !uc.completed;
    });
    for (const uc of relevantChallenges) {
      const challenge = this.challenges.get(uc.challengeId);
      if (challengeType === "happiness" || challengeType === "health" || challengeType === "energy") {
        uc.progress = Math.min(incrementBy, challenge.target);
      } else {
        uc.progress = Math.min(uc.progress + incrementBy, challenge.target);
      }
      if (uc.progress >= challenge.target) {
        uc.completed = true;
        uc.completedAt = /* @__PURE__ */ new Date();
      }
    }
  }
  async claimChallengeReward(userId, userChallengeId) {
    const userDailyChallenges = this.userChallenges.get(userId) || [];
    const userChallenge = userDailyChallenges.find((uc) => uc.id === userChallengeId);
    if (!userChallenge) {
      throw new Error("Challenge not found");
    }
    if (!userChallenge.completed) {
      throw new Error("Challenge not completed");
    }
    if (userChallenge.claimed) {
      throw new Error("Reward already claimed");
    }
    const challenge = this.challenges.get(userChallenge.challengeId);
    const user = this.users.get(userId);
    const newCoins = Math.min(user.coins + challenge.coinReward, MAX_COINS);
    user.coins = newCoins;
    userChallenge.claimed = true;
    userChallenge.claimedAt = /* @__PURE__ */ new Date();
    return {
      user,
      challenge: { ...userChallenge, challenge }
    };
  }
  // Breeding methods
  async startBreeding(userId, parent1Id, parent2Id, payWithMoney) {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const parent1 = this.pets.get(parent1Id);
    const parent2 = this.pets.get(parent2Id);
    if (!parent1 || !parent2) {
      throw new Error("Parent pets not found");
    }
    if (parent1.userId !== userId || parent2.userId !== userId) {
      throw new Error("You can only breed your own pets");
    }
    if (parent1Id === parent2Id) {
      throw new Error("Cannot breed a pet with itself");
    }
    if (!payWithMoney && user.coins < BREEDING_COST_COINS) {
      throw new Error(`Not enough coins. Breeding costs ${BREEDING_COST_COINS} coins`);
    }
    if (!payWithMoney) {
      user.coins -= BREEDING_COST_COINS;
      this.users.set(userId, user);
    }
    const id = randomUUID();
    const now = /* @__PURE__ */ new Date();
    const readyAt = new Date(now.getTime() + BREEDING_DURATION_HOURS * 60 * 60 * 1e3);
    const breedingRecord = {
      id,
      userId,
      parent1Id,
      parent2Id,
      status: "incubating",
      paidWithCoins: !payWithMoney,
      startedAt: now,
      readyAt,
      hatchedAt: null,
      eggId: null
    };
    this.breedingRecords.set(id, breedingRecord);
    return breedingRecord;
  }
  async getBreedingRecords(userId) {
    return Array.from(this.breedingRecords.values()).filter(
      (record) => record.userId === userId
    );
  }
  async getBreedingRecord(id) {
    return this.breedingRecords.get(id);
  }
  async checkAndCompleteBreeding() {
    const now = /* @__PURE__ */ new Date();
    for (const [id, record] of Array.from(this.breedingRecords.entries())) {
      if (record.status === "incubating" && record.readyAt <= now) {
        const parent1 = this.pets.get(record.parent1Id);
        const parent2 = this.pets.get(record.parent2Id);
        if (!parent1 || !parent2) continue;
        const traits = inheritTraits(parent1, parent2);
        const babyName = generateBabyName();
        const eggId = randomUUID();
        const egg = {
          id: eggId,
          userId: record.userId,
          breedingRecordId: id,
          name: babyName,
          type: traits.type,
          color: traits.color,
          pattern: traits.pattern,
          isMutation: traits.isMutation,
          parent1Id: record.parent1Id,
          parent2Id: record.parent2Id,
          createdAt: now
        };
        this.eggs.set(eggId, egg);
        record.status = "ready";
        record.eggId = eggId;
        this.breedingRecords.set(id, record);
      }
    }
  }
  async hatchEgg(userId, eggId) {
    const egg = this.eggs.get(eggId);
    if (!egg) {
      throw new Error("Egg not found");
    }
    if (egg.userId !== userId) {
      throw new Error("This is not your egg");
    }
    const newPet = await this.createPet({
      userId,
      name: egg.name,
      type: egg.type,
      color: egg.color,
      pattern: egg.pattern,
      isMutation: egg.isMutation,
      parent1Id: egg.parent1Id,
      parent2Id: egg.parent2Id
    });
    const breedingRecord = Array.from(this.breedingRecords.values()).find(
      (r) => r.eggId === eggId
    );
    if (breedingRecord) {
      breedingRecord.status = "hatched";
      breedingRecord.hatchedAt = /* @__PURE__ */ new Date();
      this.breedingRecords.set(breedingRecord.id, breedingRecord);
    }
    this.eggs.delete(eggId);
    return { egg, pet: newPet };
  }
  async getUserEggs(userId) {
    return Array.from(this.eggs.values()).filter((egg) => egg.userId === userId);
  }
  // Mini-game methods
  async getMiniGames() {
    return Array.from(this.miniGames.values());
  }
  async getUserMiniGameSessions(userId, gameId) {
    const sessions = this.userMiniGameSessions.get(userId) || [];
    if (gameId) {
      return sessions.filter((s) => s.gameId === gameId);
    }
    return sessions;
  }
  async getLastGameSession(userId, gameId) {
    const sessions = this.userMiniGameSessions.get(userId) || [];
    const gameSessions = sessions.filter((s) => s.gameId === gameId);
    if (gameSessions.length === 0) return void 0;
    return gameSessions.reduce(
      (latest, current) => current.playedAt > latest.playedAt ? current : latest
    );
  }
  async recordGameSession(session2) {
    const id = randomUUID();
    const newSession = {
      id,
      ...session2,
      playedAt: /* @__PURE__ */ new Date()
    };
    const userSessions = this.userMiniGameSessions.get(session2.userId) || [];
    userSessions.push(newSession);
    this.userMiniGameSessions.set(session2.userId, userSessions);
    return newSession;
  }
};
var DbStorage = class {
  db;
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const sql2 = postgres(connectionString);
    this.db = drizzle(sql2);
    this.initializeShopItems();
    this.initializeChallenges();
    this.initializeMiniGames();
  }
  async initializeShopItems() {
    const existing = await this.db.select().from(shopItems);
    if (existing.length === 0) {
      const items = [
        {
          name: "Basic Food",
          description: "Fills your pet's belly",
          category: "food",
          price: 10,
          effect: JSON.stringify({ hunger: 25 }),
          image: null
        },
        {
          name: "Premium Food",
          description: "Delicious premium meal",
          category: "food",
          price: 25,
          effect: JSON.stringify({ hunger: 50 }),
          image: null
        },
        {
          name: "Ball",
          description: "A fun toy for your pet",
          category: "toy",
          price: 15,
          effect: JSON.stringify({ happiness: 30 }),
          image: null
        },
        {
          name: "Chew Toy",
          description: "Keeps your pet entertained",
          category: "toy",
          price: 20,
          effect: JSON.stringify({ happiness: 40 }),
          image: null
        },
        {
          name: "Energy Drink",
          description: "Restores your pet's energy",
          category: "food",
          price: 30,
          effect: JSON.stringify({ energy: 50 }),
          image: null
        },
        {
          name: "Soap",
          description: "Cleans your pet",
          category: "cleaning",
          price: 12,
          effect: JSON.stringify({ cleanliness: 40 }),
          image: null
        }
      ];
      await this.db.insert(shopItems).values(items);
    }
  }
  // User operations
  async getUser(id) {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  async getUserByUsername(username) {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  async getUserByEmail(email) {
    const result = await this.db.select().from(users).where(eq(users.email, email));
    return result[0];
  }
  async getUserByVerificationToken(token) {
    const result = await this.db.select().from(users).where(
      and(
        eq(users.verificationToken, token),
        eq(users.verified, false)
      )
    );
    if (result.length === 0) return void 0;
    const user = result[0];
    if (user.verificationTokenExpiry && user.verificationTokenExpiry < /* @__PURE__ */ new Date()) {
      return void 0;
    }
    return user;
  }
  async getUserByResetToken(token) {
    const result = await this.db.select().from(users).where(eq(users.resetToken, token));
    if (result.length === 0) return void 0;
    const user = result[0];
    if (user.resetTokenExpiry && user.resetTokenExpiry < /* @__PURE__ */ new Date()) {
      return void 0;
    }
    return user;
  }
  async createUser(username, email, passwordHash, authType = "local") {
    const result = await this.db.insert(users).values({
      username,
      email,
      passwordHash,
      authType
    }).returning();
    return result[0];
  }
  async updateUserCoins(userId, coins, gems) {
    const cappedCoins = Math.min(coins, MAX_COINS);
    const result = await this.db.update(users).set({ coins: cappedCoins, gems }).where(eq(users.id, userId)).returning();
    return result[0];
  }
  async claimDailyReward(userId) {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    const now = /* @__PURE__ */ new Date();
    const lastReward = user.lastDailyReward;
    let newStreak = 1;
    if (lastReward) {
      const hoursSince = (now.getTime() - lastReward.getTime()) / (1e3 * 60 * 60);
      if (hoursSince < 24) {
        throw new Error("Already claimed today");
      }
      if (hoursSince < 48) {
        newStreak = user.dailyStreak + 1;
      }
    }
    const streakBonus = Math.min(newStreak * 10, 100);
    const coinsReward = DAILY_LOGIN_BONUS + streakBonus;
    const newCoins = Math.min(user.coins + coinsReward, MAX_COINS);
    const result = await this.db.update(users).set({
      coins: newCoins,
      dailyStreak: newStreak,
      lastDailyReward: now
    }).where(eq(users.id, userId)).returning();
    return result[0];
  }
  async setVerificationToken(userId, token, expiry) {
    const result = await this.db.update(users).set({
      verificationToken: token,
      verificationTokenExpiry: expiry
    }).where(eq(users.id, userId)).returning();
    return result[0];
  }
  async verifyUser(userId) {
    const result = await this.db.update(users).set({
      verified: true,
      verificationToken: null,
      verificationTokenExpiry: null
    }).where(eq(users.id, userId)).returning();
    return result[0];
  }
  async setResetToken(userId, token, expiry) {
    const result = await this.db.update(users).set({
      resetToken: token,
      resetTokenExpiry: expiry
    }).where(eq(users.id, userId)).returning();
    return result[0];
  }
  async resetPassword(userId, passwordHash) {
    const result = await this.db.update(users).set({
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null
    }).where(eq(users.id, userId)).returning();
    return result[0];
  }
  async updateUserAuthType(userId, authType) {
    const result = await this.db.update(users).set({ authType }).where(eq(users.id, userId)).returning();
    return result[0];
  }
  async markEmailVerified(userId) {
    return this.verifyUser(userId);
  }
  async togglePremium(userId) {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    const result = await this.db.update(users).set({ premium: !user.premium }).where(eq(users.id, userId)).returning();
    return result[0];
  }
  async watchAdBonus(userId) {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    if (user.premium) {
      throw new Error("Premium users cannot watch ads");
    }
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const lastAdDate = user.lastAdDate ? new Date(user.lastAdDate) : null;
    const shouldReset = !lastAdDate || lastAdDate < today;
    let adsWatchedToday = user.adsWatchedToday;
    if (shouldReset) {
      adsWatchedToday = 0;
    }
    const MAX_ADS_PER_DAY = 5;
    if (adsWatchedToday >= MAX_ADS_PER_DAY) {
      throw new Error("Daily ad limit reached");
    }
    const AD_BONUS = 50;
    const newCoins = Math.min(user.coins + AD_BONUS, MAX_COINS);
    const coinsEarned = newCoins - user.coins;
    const result = await this.db.update(users).set({
      coins: newCoins,
      adsWatchedToday: adsWatchedToday + 1,
      lastAdDate: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId)).returning();
    const adsRemaining = MAX_ADS_PER_DAY - (adsWatchedToday + 1);
    return { user: result[0], coinsEarned, adsRemaining };
  }
  async updateNotificationPreferences(userId, preferences) {
    const updateData = {};
    if (preferences.notificationsEnabled !== void 0) {
      updateData.notificationsEnabled = preferences.notificationsEnabled;
    }
    if (preferences.notifyHunger !== void 0) {
      updateData.notifyHunger = preferences.notifyHunger;
    }
    if (preferences.notifyHappiness !== void 0) {
      updateData.notifyHappiness = preferences.notifyHappiness;
    }
    if (preferences.notifyChallenges !== void 0) {
      updateData.notifyChallenges = preferences.notifyChallenges;
    }
    if (preferences.notifyEvolution !== void 0) {
      updateData.notifyEvolution = preferences.notifyEvolution;
    }
    const result = await this.db.update(users).set(updateData).where(eq(users.id, userId)).returning();
    return result[0];
  }
  async completeTutorial(userId, starterPetName, starterPetType) {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    if (user.tutorialCompleted) {
      throw new Error("Tutorial already completed");
    }
    const newCoins = Math.min(user.coins + 100, MAX_COINS);
    const updatedUserResult = await this.db.update(users).set({
      coins: newCoins,
      tutorialCompleted: true
    }).where(eq(users.id, userId)).returning();
    const pet = await this.createPet({
      userId,
      name: starterPetName,
      type: starterPetType
    });
    return { user: updatedUserResult[0], pet };
  }
  async skipTutorial(userId) {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    if (user.tutorialCompleted) {
      throw new Error("Tutorial already completed");
    }
    const updatedUserResult = await this.db.update(users).set({
      tutorialCompleted: true
    }).where(eq(users.id, userId)).returning();
    const pet = await this.createPet({
      userId,
      name: "Buddy",
      type: "Fluffy"
    });
    return { user: updatedUserResult[0], pet };
  }
  // Pet operations
  async getPet(id) {
    const result = await this.db.select().from(pets).where(eq(pets.id, id));
    return result[0];
  }
  async getPetByUserId(userId) {
    const result = await this.db.select().from(pets).where(eq(pets.userId, userId));
    return result[0];
  }
  async getAllPetsByUserId(userId) {
    return await this.db.select().from(pets).where(eq(pets.userId, userId));
  }
  async createPet(pet) {
    const result = await this.db.insert(pets).values(pet).returning();
    return result[0];
  }
  async updatePetStats(petId, stats, timestamps) {
    const result = await this.db.update(pets).set({ ...stats, ...timestamps, lastUpdated: /* @__PURE__ */ new Date() }).where(eq(pets.id, petId)).returning();
    return result[0];
  }
  async updatePetMood(petId, mood) {
    const result = await this.db.update(pets).set({ mood }).where(eq(pets.id, petId)).returning();
    return result[0];
  }
  async addPetXP(petId, xpGain) {
    const pet = await this.getPet(petId);
    if (!pet) throw new Error("Pet not found");
    const result = calculateLevelAndEvolution(pet.level, pet.xp, pet.evolutionStage, xpGain);
    const updated = await this.db.update(pets).set({
      level: result.newLevel,
      xp: result.newXP,
      evolutionStage: result.newStage
    }).where(eq(pets.id, petId)).returning();
    if (!updated[0]) throw new Error("Failed to update pet");
    return {
      pet: updated[0],
      leveledUp: result.leveledUp,
      evolved: result.evolved
    };
  }
  async performPetAction(userId, petId, actionType) {
    const pet = await this.getPet(petId);
    if (!pet) throw new Error("Pet not found");
    if (pet.userId !== userId) throw new Error("Unauthorized");
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    const action = PET_ACTIONS[actionType];
    if (!action) throw new Error("Invalid action type");
    const now = /* @__PURE__ */ new Date();
    const stats = {};
    const timestamps = {};
    for (const [stat, delta] of Object.entries(action.statIncrease)) {
      const currentValue = pet[stat];
      stats[stat] = Math.max(0, Math.min(100, currentValue + delta));
    }
    if (actionType === "feed") timestamps.lastFed = now;
    else if (actionType === "play") timestamps.lastPlayed = now;
    else if (actionType === "clean") timestamps.lastCleaned = now;
    let updatedPet = await this.updatePetStats(petId, stats, timestamps);
    const xpResult = await this.addPetXP(petId, action.xpReward);
    updatedPet = xpResult.pet;
    const updatedUser = await this.updateUserCoins(userId, user.coins + action.coinReward, user.gems);
    await this.updateChallengeProgress(userId, actionType, 1);
    if (updatedPet.happiness >= 0) {
      await this.updateChallengeProgress(userId, "happiness", updatedPet.happiness);
    }
    if (updatedPet.health >= 0) {
      await this.updateChallengeProgress(userId, "health", updatedPet.health);
    }
    if (updatedPet.energy >= 0) {
      await this.updateChallengeProgress(userId, "energy", updatedPet.energy);
    }
    const cooldowns = {
      feed: 0,
      play: 0,
      clean: 0,
      sleep: 0
    };
    const response = {
      pet: updatedPet,
      user: updatedUser,
      cooldowns
    };
    if (xpResult.leveledUp) {
      response.leveledUp = true;
      response.newLevel = updatedPet.level;
    }
    if (xpResult.evolved) {
      response.evolved = true;
      response.newStage = updatedPet.evolutionStage;
    }
    return response;
  }
  async applyStatDecay(petId) {
    const pet = await this.getPet(petId);
    if (!pet) throw new Error("Pet not found");
    const decayedStats = calculateStatDecay(pet);
    const result = await this.db.update(pets).set({
      hunger: decayedStats.hunger,
      happiness: decayedStats.happiness,
      cleanliness: decayedStats.cleanliness,
      health: decayedStats.health,
      isSick: decayedStats.isSick,
      lastHungerDecay: decayedStats.newLastHungerDecay,
      lastHappinessDecay: decayedStats.newLastHappinessDecay,
      lastCleanlinessDecay: decayedStats.newLastCleanlinessDecay,
      lastHealthDecay: decayedStats.newLastHealthDecay,
      lastUpdated: /* @__PURE__ */ new Date()
    }).where(eq(pets.id, petId)).returning();
    return result[0];
  }
  // Shop & Inventory
  async getAllShopItems() {
    return await this.db.select().from(shopItems);
  }
  async getShopItem(id) {
    const result = await this.db.select().from(shopItems).where(eq(shopItems.id, id));
    return result[0];
  }
  async getUserInventory(userId) {
    return await this.db.select().from(inventory).where(eq(inventory.userId, userId));
  }
  async addToInventory(userId, itemId, quantity) {
    const existing = await this.db.select().from(inventory).where(
      and(
        eq(inventory.userId, userId),
        eq(inventory.itemId, itemId)
      )
    );
    if (existing.length > 0) {
      const result = await this.db.update(inventory).set({ quantity: existing[0].quantity + quantity }).where(eq(inventory.id, existing[0].id)).returning();
      return result[0];
    } else {
      const result = await this.db.insert(inventory).values({ userId, itemId, quantity }).returning();
      return result[0];
    }
  }
  async purchaseItem(userId, itemId) {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    const item = await this.getShopItem(itemId);
    if (!item) throw new Error("Shop item not found");
    if (user.coins < item.price) {
      throw new Error("Insufficient coins");
    }
    const updatedUser = await this.updateUserCoins(userId, user.coins - item.price, user.gems);
    const inventoryItem = await this.addToInventory(userId, itemId, 1);
    return { user: updatedUser, inventory: inventoryItem };
  }
  async useInventoryItem(userId, itemId) {
    const existing = await this.db.select().from(inventory).where(
      and(
        eq(inventory.userId, userId),
        eq(inventory.itemId, itemId)
      )
    );
    if (existing.length === 0 || existing[0].quantity <= 0) return void 0;
    const newQuantity = existing[0].quantity - 1;
    if (newQuantity === 0) {
      await this.db.delete(inventory).where(eq(inventory.id, existing[0].id));
      return { ...existing[0], quantity: 0 };
    } else {
      const result = await this.db.update(inventory).set({ quantity: newQuantity }).where(eq(inventory.id, existing[0].id)).returning();
      return result[0];
    }
  }
  // Leaderboard methods
  async getLeaderboardByHighestLevelPet(currentUserId) {
    const results = await this.db.select({
      userId: pets.userId,
      username: users.username,
      maxLevel: max(pets.level).as("max_level")
    }).from(pets).innerJoin(users, eq(pets.userId, users.id)).groupBy(pets.userId, users.username).orderBy(desc(sqlOp`max(${pets.level})`)).limit(50);
    const leaderboard = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const maxLevel = Number(result.maxLevel ?? 0);
      const topPet = await this.db.select().from(pets).where(and(
        eq(pets.userId, result.userId),
        eq(pets.level, maxLevel)
      )).limit(1);
      leaderboard.push({
        userId: result.userId,
        username: result.username,
        maxLevel,
        petName: topPet[0]?.name || "Unknown",
        rank: i + 1
      });
    }
    const currentUserPets = await this.db.select({
      maxLevel: max(pets.level).as("max_level")
    }).from(pets).where(eq(pets.userId, currentUserId)).groupBy(pets.userId);
    let currentUserRank = null;
    if (currentUserPets.length > 0) {
      const currentMaxLevel = Number(currentUserPets[0].maxLevel ?? 0);
      const higherRankedUsers = await this.db.select({
        userId: pets.userId,
        maxLevel: max(pets.level).as("max_level")
      }).from(pets).groupBy(pets.userId).having(sqlOp`max(${pets.level}) > ${currentMaxLevel}`);
      currentUserRank = higherRankedUsers.length + 1;
    }
    return { leaderboard, currentUserRank };
  }
  async getLeaderboardByMostPets(currentUserId) {
    const results = await this.db.select({
      userId: pets.userId,
      username: users.username,
      petCount: count(pets.id).as("pet_count")
    }).from(pets).innerJoin(users, eq(pets.userId, users.id)).groupBy(pets.userId, users.username).orderBy(desc(count(pets.id))).limit(50);
    const leaderboard = results.map((result, index2) => ({
      userId: result.userId,
      username: result.username,
      petCount: Number(result.petCount ?? 0),
      rank: index2 + 1
    }));
    const currentUserPetCount = await this.db.select({
      petCount: count(pets.id).as("pet_count")
    }).from(pets).where(eq(pets.userId, currentUserId));
    let currentUserRank = null;
    if (currentUserPetCount.length > 0) {
      const currentCount = Number(currentUserPetCount[0].petCount ?? 0);
      const higherRankedUsers = await this.db.select({
        userId: pets.userId,
        petCount: count(pets.id).as("pet_count")
      }).from(pets).groupBy(pets.userId).having(sqlOp`count(${pets.id}) > ${currentCount}`);
      currentUserRank = higherRankedUsers.length + 1;
    }
    return { leaderboard, currentUserRank };
  }
  async getLeaderboardByTotalCoins(currentUserId) {
    const results = await this.db.select({
      userId: users.id,
      username: users.username,
      coins: users.coins
    }).from(users).orderBy(desc(users.coins)).limit(50);
    const leaderboard = results.map((result, index2) => ({
      userId: result.userId,
      username: result.username,
      coins: Number(result.coins ?? 0),
      rank: index2 + 1
    }));
    const currentUserData = await this.db.select({
      coins: users.coins
    }).from(users).where(eq(users.id, currentUserId)).limit(1);
    let currentUserRank = null;
    if (currentUserData.length > 0) {
      const currentCoins = Number(currentUserData[0].coins ?? 0);
      const higherRankedCount = await this.db.select({
        count: count(users.id).as("count")
      }).from(users).where(sqlOp`${users.coins} > ${currentCoins}`);
      const higherRanked = Number(higherRankedCount[0]?.count ?? 0);
      currentUserRank = higherRanked + 1;
    }
    return { leaderboard, currentUserRank };
  }
  // Daily Challenges
  async getDailyChallenges(userId) {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todaysChallenges = await this.db.select().from(userChallenges).where(and(
      eq(userChallenges.userId, userId),
      gte(userChallenges.assignedDate, today),
      lt(userChallenges.assignedDate, tomorrow)
    ));
    if (todaysChallenges.length < 3) {
      const allChallenges = await this.db.select().from(challenges);
      const existingIds = new Set(todaysChallenges.map((c) => c.challengeId));
      const availableChallenges = allChallenges.filter((c) => !existingIds.has(c.id));
      const shuffled = availableChallenges.sort(() => Math.random() - 0.5);
      const needed = 3 - todaysChallenges.length;
      const toAssign = shuffled.slice(0, needed);
      for (const challenge of toAssign) {
        const [newUserChallenge] = await this.db.insert(userChallenges).values({
          userId,
          challengeId: challenge.id,
          progress: 0,
          completed: false,
          claimed: false,
          assignedDate: today
        }).returning();
        todaysChallenges.push(newUserChallenge);
      }
    }
    const challengesWithDetails = await Promise.all(
      todaysChallenges.map(async (uc) => {
        const [challenge] = await this.db.select().from(challenges).where(eq(challenges.id, uc.challengeId)).limit(1);
        return { ...uc, challenge };
      })
    );
    return challengesWithDetails;
  }
  async updateChallengeProgress(userId, challengeType, incrementBy) {
    if (incrementBy < 0) {
      throw new Error("Challenge progress increment cannot be negative");
    }
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todaysChallenges = await this.db.select().from(userChallenges).where(and(
      eq(userChallenges.userId, userId),
      eq(userChallenges.completed, false),
      gte(userChallenges.assignedDate, today),
      lt(userChallenges.assignedDate, tomorrow)
    ));
    for (const uc of todaysChallenges) {
      const [challenge] = await this.db.select().from(challenges).where(eq(challenges.id, uc.challengeId)).limit(1);
      if (!challenge || challenge.type !== challengeType) continue;
      let newProgress = uc.progress;
      if (challengeType === "happiness" || challengeType === "health" || challengeType === "energy") {
        newProgress = Math.min(incrementBy, challenge.target);
      } else {
        newProgress = Math.min(uc.progress + incrementBy, challenge.target);
      }
      const isCompleted = newProgress >= challenge.target;
      await this.db.update(userChallenges).set({
        progress: newProgress,
        completed: isCompleted,
        completedAt: isCompleted ? /* @__PURE__ */ new Date() : uc.completedAt
      }).where(eq(userChallenges.id, uc.id));
    }
  }
  async claimChallengeReward(userId, userChallengeId) {
    return await this.db.transaction(async (tx) => {
      const [updatedChallenge] = await tx.update(userChallenges).set({
        claimed: true,
        claimedAt: /* @__PURE__ */ new Date()
      }).where(and(
        eq(userChallenges.id, userChallengeId),
        eq(userChallenges.userId, userId),
        eq(userChallenges.completed, true),
        eq(userChallenges.claimed, false)
      )).returning();
      if (!updatedChallenge) {
        const [userChallenge] = await tx.select().from(userChallenges).where(and(
          eq(userChallenges.id, userChallengeId),
          eq(userChallenges.userId, userId)
        )).limit(1);
        if (!userChallenge) {
          throw new Error("Challenge not found");
        }
        if (!userChallenge.completed) {
          throw new Error("Challenge not completed");
        }
        if (userChallenge.claimed) {
          throw new Error("Reward already claimed");
        }
        throw new Error("Failed to claim reward");
      }
      const [challenge] = await tx.select().from(challenges).where(eq(challenges.id, updatedChallenge.challengeId)).limit(1);
      if (!challenge) {
        throw new Error("Challenge template not found");
      }
      const [user] = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) {
        throw new Error("User not found");
      }
      const newCoins = Math.min(user.coins + challenge.coinReward, MAX_COINS);
      const [updatedUser] = await tx.update(users).set({ coins: newCoins }).where(eq(users.id, userId)).returning();
      return {
        user: updatedUser,
        challenge: { ...updatedChallenge, challenge }
      };
    });
  }
  async initializeChallenges() {
    const existing = await this.db.select().from(challenges);
    if (existing.length === 0) {
      await this.db.insert(challenges).values(DAILY_CHALLENGES);
    }
  }
  async initializeMiniGames() {
    const existing = await this.db.select().from(miniGames);
    if (existing.length === 0) {
      await this.db.insert(miniGames).values(MINI_GAMES);
    }
  }
  // Breeding methods
  async startBreeding(userId, parent1Id, parent2Id, payWithMoney) {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    const parent1 = await this.getPet(parent1Id);
    const parent2 = await this.getPet(parent2Id);
    if (!parent1 || !parent2) {
      throw new Error("Parent pets not found");
    }
    if (parent1.userId !== userId || parent2.userId !== userId) {
      throw new Error("You can only breed your own pets");
    }
    if (parent1Id === parent2Id) {
      throw new Error("Cannot breed a pet with itself");
    }
    if (!payWithMoney && user.coins < BREEDING_COST_COINS) {
      throw new Error(`Not enough coins. Breeding costs ${BREEDING_COST_COINS} coins`);
    }
    if (!payWithMoney) {
      await this.db.update(users).set({ coins: user.coins - BREEDING_COST_COINS }).where(eq(users.id, userId));
    }
    const now = /* @__PURE__ */ new Date();
    const readyAt = new Date(now.getTime() + BREEDING_DURATION_HOURS * 60 * 60 * 1e3);
    const [breedingRecord] = await this.db.insert(breedingRecords).values({
      userId,
      parent1Id,
      parent2Id,
      status: "incubating",
      paidWithCoins: !payWithMoney,
      readyAt
    }).returning();
    return breedingRecord;
  }
  async getBreedingRecords(userId) {
    return await this.db.select().from(breedingRecords).where(eq(breedingRecords.userId, userId));
  }
  async getBreedingRecord(id) {
    const result = await this.db.select().from(breedingRecords).where(eq(breedingRecords.id, id)).limit(1);
    return result[0];
  }
  async checkAndCompleteBreeding() {
    const now = /* @__PURE__ */ new Date();
    const readyRecords = await this.db.select().from(breedingRecords).where(
      and(
        eq(breedingRecords.status, "incubating"),
        lt(breedingRecords.readyAt, now)
      )
    );
    for (const record of readyRecords) {
      const parent1 = await this.getPet(record.parent1Id);
      const parent2 = await this.getPet(record.parent2Id);
      if (!parent1 || !parent2) continue;
      const traits = inheritTraits(parent1, parent2);
      const babyName = generateBabyName();
      const [egg] = await this.db.insert(eggs).values({
        userId: record.userId,
        breedingRecordId: record.id,
        name: babyName,
        type: traits.type,
        color: traits.color,
        pattern: traits.pattern,
        isMutation: traits.isMutation,
        parent1Id: record.parent1Id,
        parent2Id: record.parent2Id
      }).returning();
      await this.db.update(breedingRecords).set({
        status: "ready",
        eggId: egg.id
      }).where(eq(breedingRecords.id, record.id));
    }
  }
  async hatchEgg(userId, eggId) {
    const [egg] = await this.db.select().from(eggs).where(eq(eggs.id, eggId)).limit(1);
    if (!egg) {
      throw new Error("Egg not found");
    }
    if (egg.userId !== userId) {
      throw new Error("This is not your egg");
    }
    const newPet = await this.createPet({
      userId,
      name: egg.name,
      type: egg.type,
      color: egg.color,
      pattern: egg.pattern,
      isMutation: egg.isMutation,
      parent1Id: egg.parent1Id,
      parent2Id: egg.parent2Id
    });
    const now = /* @__PURE__ */ new Date();
    await this.db.update(breedingRecords).set({
      status: "hatched",
      hatchedAt: now
    }).where(eq(breedingRecords.eggId, eggId));
    await this.db.delete(eggs).where(eq(eggs.id, eggId));
    return { egg, pet: newPet };
  }
  async getUserEggs(userId) {
    return await this.db.select().from(eggs).where(eq(eggs.userId, userId));
  }
  // Mini-game methods
  async getMiniGames() {
    return await this.db.select().from(miniGames);
  }
  async getUserMiniGameSessions(userId, gameId) {
    if (gameId) {
      return await this.db.select().from(userMiniGameSessions).where(
        and(
          eq(userMiniGameSessions.userId, userId),
          eq(userMiniGameSessions.gameId, gameId)
        )
      ).orderBy(desc(userMiniGameSessions.playedAt));
    }
    return await this.db.select().from(userMiniGameSessions).where(eq(userMiniGameSessions.userId, userId)).orderBy(desc(userMiniGameSessions.playedAt));
  }
  async getLastGameSession(userId, gameId) {
    const result = await this.db.select().from(userMiniGameSessions).where(
      and(
        eq(userMiniGameSessions.userId, userId),
        eq(userMiniGameSessions.gameId, gameId)
      )
    ).orderBy(desc(userMiniGameSessions.playedAt)).limit(1);
    return result[0];
  }
  async recordGameSession(session2) {
    const [newSession] = await this.db.insert(userMiniGameSessions).values(session2).returning();
    return newSession;
  }
};
var storage;
if (process.env.DATABASE_URL) {
  try {
    storage = new DbStorage();
    console.log("\u2705 Database storage initialized (PostgreSQL/Supabase)");
  } catch (error) {
    console.warn("\u26A0\uFE0F Database connection failed, falling back to memory storage");
    console.warn("Error:", error instanceof Error ? error.message : String(error));
    storage = new MemStorage();
  }
} else {
  console.warn("\u26A0\uFE0F DATABASE_URL not set. Using in-memory storage (MemStorage).");
  console.warn("   To use persistent storage, set DATABASE_URL to a PostgreSQL/Supabase connection string.");
  storage = new MemStorage();
}

// server/passport.ts
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
function setupPassport() {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: "http://localhost:5000/api/auth/google/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error("No email provided by Google"), void 0);
            }
            let user = await storage.getUserByEmail(email);
            if (user) {
              if (user.authType === "local") {
                await storage.updateUserAuthType(user.id, "google");
                await storage.markEmailVerified(user.id);
                user = await storage.getUser(user.id);
              }
              return done(null, user);
            }
            const username = profile.displayName?.replace(/\s+/g, "_").toLowerCase() || email.split("@")[0];
            let uniqueUsername = username;
            let counter = 1;
            while (await storage.getUserByUsername(uniqueUsername)) {
              uniqueUsername = `${username}${counter}`;
              counter++;
            }
            user = await storage.createUser(uniqueUsername, email, null, "google");
            await storage.markEmailVerified(user.id);
            return done(null, user);
          } catch (error) {
            return done(error, void 0);
          }
        }
      )
    );
  }
}

// server/routes.ts
import { createServer } from "http";
import bcrypt from "bcryptjs";

// server/email.ts
import { Resend } from "resend";
import crypto from "crypto";
var EMAIL_SENDER = process.env.EMAIL_SENDER || "ToyPetMe <noreply@toypetme.com>";
var FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5000";
function getResendClient() {
  if (!process.env.EMAIL_API_KEY) {
    return null;
  }
  return new Resend(process.env.EMAIL_API_KEY);
}
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}
async function sendVerificationEmail(email, username, token) {
  const verificationUrl = `${FRONTEND_URL}/verify?token=${token}`;
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .content p { color: #4b5563; line-height: 1.6; margin: 16px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 24px 0; }
    .footer { background: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { color: #6b7280; font-size: 14px; margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>\u{1F43E} Welcome to ToyPetMe!</h1>
    </div>
    <div class="content">
      <p>Hi ${username},</p>
      <p>Thanks for signing up! We're excited to have you join our community of virtual pet lovers.</p>
      <p>To start caring for your new pet, please verify your email address by clicking the button below:</p>
      <p style="text-align: center;">
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="background: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 14px; color: #6b7280;">
        ${verificationUrl}
      </p>
      <p><strong>This link will expire in 24 hours.</strong></p>
      <p>If you didn't create an account with ToyPetMe, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>Happy pet caring! \u{1F3AE}</p>
      <p>The ToyPetMe Team</p>
    </div>
  </div>
</body>
</html>
  `.trim();
  try {
    const resend = getResendClient();
    if (!resend) {
      console.log("\u{1F4E7} [DEV MODE] Verification email for", email);
      console.log("\u{1F517} Verification URL:", verificationUrl);
      return;
    }
    const result = await resend.emails.send({
      from: EMAIL_SENDER,
      to: email,
      subject: "Verify your ToyPetMe email address",
      html: htmlContent
    });
    if (result.error) {
      console.error("\u274C Resend API error sending verification email:", result.error);
      throw new Error(`Email delivery failed: ${result.error.message}`);
    }
    console.log("\u2705 Verification email sent to:", email, "| Email ID:", result.data?.id);
  } catch (error) {
    console.error("\u274C Failed to send verification email to", email, ":", error);
    throw error instanceof Error ? error : new Error("Failed to send verification email");
  }
}
async function sendPasswordResetEmail(email, username, token) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .content p { color: #4b5563; line-height: 1.6; margin: 16px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 24px 0; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 6px; }
    .footer { background: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { color: #6b7280; font-size: 14px; margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>\u{1F510} Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hi ${username},</p>
      <p>We received a request to reset your password for your ToyPetMe account.</p>
      <p>Click the button below to create a new password:</p>
      <p style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="background: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 14px; color: #6b7280;">
        ${resetUrl}
      </p>
      <div class="warning">
        <p style="margin: 0; color: #92400e; font-weight: 600;">\u26A0\uFE0F Important Security Notice</p>
        <p style="margin: 8px 0 0 0; color: #92400e;">This link will expire in 15 minutes for your security.</p>
      </div>
      <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
    </div>
    <div class="footer">
      <p>Stay secure! \u{1F6E1}\uFE0F</p>
      <p>The ToyPetMe Team</p>
    </div>
  </div>
</body>
</html>
  `.trim();
  try {
    const resend = getResendClient();
    if (!resend) {
      console.log("\u{1F4E7} [DEV MODE] Password reset email for", email);
      console.log("\u{1F517} Reset URL:", resetUrl);
      return;
    }
    const result = await resend.emails.send({
      from: EMAIL_SENDER,
      to: email,
      subject: "Reset your ToyPetMe password",
      html: htmlContent
    });
    if (result.error) {
      console.error("\u274C Resend API error sending password reset email:", result.error);
      throw new Error(`Email delivery failed: ${result.error.message}`);
    }
    console.log("\u2705 Password reset email sent to:", email, "| Email ID:", result.data?.id);
  } catch (error) {
    console.error("\u274C Failed to send password reset email to", email, ":", error);
    throw error instanceof Error ? error : new Error("Failed to send password reset email");
  }
}

// server/routes.ts
import rateLimit from "express-rate-limit";
import passport2 from "passport";

// server/jwt.ts
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET;
var JWT_EXPIRATION = process.env.JWT_EXPIRATION || "15m";
var JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || "7d";
if (!JWT_SECRET) {
  console.error("\u274C CRITICAL: JWT_SECRET environment variable is not set!");
  console.error("   JWT authentication will not work. Please set JWT_SECRET in your environment.");
  process.exit(1);
}
function generateJWT(user) {
  const payload = {
    id: user.id,
    email: user.email,
    verified: user.verified
  };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION
  });
}
function generateRefreshToken(user) {
  const payload = {
    id: user.id,
    email: user.email
  };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRATION
  });
}
function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: false });
    return { id: decoded.id, email: decoded.email };
  } catch {
    return null;
  }
}

// server/routes.ts
import { z as z2 } from "zod";
function evaluateCooldown(lastActionTime, cooldownMinutes) {
  if (!lastActionTime) {
    return { ready: true, remainingSeconds: 0 };
  }
  const now = Date.now();
  const lastAction = new Date(lastActionTime).getTime();
  const cooldownMs = cooldownMinutes * 60 * 1e3;
  const elapsedMs = now - lastAction;
  if (elapsedMs >= cooldownMs) {
    return { ready: true, remainingSeconds: 0 };
  }
  const remainingMs = cooldownMs - elapsedMs;
  return { ready: false, remainingSeconds: Math.ceil(remainingMs / 1e3) };
}
async function registerRoutes(app2) {
  const calculateMood = (hunger, happiness, energy) => {
    if (hunger < 20 || happiness < 20 || energy < 20) return "sad";
    if (hunger > 70 && happiness > 70 && energy > 70) return "happy";
    if (energy < 30) return "sleeping";
    return "neutral";
  };
  const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    next();
  };
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: 5,
    // 5 requests per window
    message: { error: "Too many attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false
  });
  app2.post("/api/auth/signup", async (req, res) => {
    try {
      const validation = signupSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }
      const { username, email, password } = validation.data;
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.createUser(username, email, passwordHash, "local");
      const verificationToken = generateToken();
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      await storage.setVerificationToken(user.id, verificationToken, tokenExpiry);
      sendVerificationEmail(email, username, verificationToken).catch((err) => {
        console.error("Failed to send verification email:", err);
      });
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ error: "Failed to create session" });
        }
        req.session.userId = user.id;
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return res.status(500).json({ error: "Failed to save session" });
          }
          const { passwordHash: _, ...userWithoutPassword } = user;
          res.json(userWithoutPassword);
        });
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    const maskedEmail = req.body.email ? req.body.email.replace(/(.{2})(.*)(@.*)/, "$1***$3") : "unknown";
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        console.log(`\u{1F512} Login failed - validation error for ${maskedEmail}`);
        return res.status(400).json({ error: validation.error.errors[0].message });
      }
      const { email, password } = validation.data;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log(`\u{1F512} Login failed - user not found: ${maskedEmail}`);
        return res.status(401).json({ error: "Invalid email or password" });
      }
      if (!user.passwordHash) {
        console.log(`\u{1F512} Login failed - OAuth user tried password login: ${maskedEmail}`);
        return res.status(401).json({ error: "Please use Google sign-in for this account" });
      }
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        console.log(`\u{1F512} Login failed - invalid password for: ${maskedEmail}`);
        return res.status(401).json({ error: "Invalid email or password" });
      }
      req.session.regenerate((err) => {
        if (err) {
          console.error(`\u274C Session regeneration error for ${maskedEmail}:`, err);
          return res.status(500).json({ error: "Failed to create session" });
        }
        req.session.userId = user.id;
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error(`\u274C Session save error for ${maskedEmail}:`, saveErr);
            return res.status(500).json({ error: "Failed to save session" });
          }
          console.log(`\u2705 Login successful for ${maskedEmail} (userId: ${user.id})`);
          const { passwordHash: _, ...userWithoutPassword } = user;
          res.json(userWithoutPassword);
        });
      });
    } catch (error) {
      console.error(`\u274C Login error for ${maskedEmail}:`, error);
      res.status(500).json({ error: "Failed to login" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  app2.get("/api/auth/verify", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        return res.status(400).json({ error: "Invalid verification token" });
      }
      const user = await storage.getUserByVerificationToken(token);
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired verification token" });
      }
      if (user.verificationTokenExpiry && /* @__PURE__ */ new Date() > user.verificationTokenExpiry) {
        return res.status(400).json({ error: "Verification token has expired" });
      }
      await storage.verifyUser(user.id);
      res.json({ message: "Email verified successfully! You can now log in." });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ error: "Failed to verify email" });
    }
  });
  app2.post("/api/auth/resend-verification", authLimiter, async (req, res) => {
    try {
      const validation = requestResetSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }
      const { email } = validation.data;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "If that email exists and is unverified, a verification link has been sent" });
      }
      if (user.verified) {
        return res.json({ message: "Email is already verified" });
      }
      const verificationToken = generateToken();
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      await storage.setVerificationToken(user.id, verificationToken, tokenExpiry);
      sendVerificationEmail(email, user.username, verificationToken).catch((err) => {
        console.error("Failed to send verification email:", err);
      });
      res.json({ message: "Verification email sent! Check your inbox." });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ error: "Failed to resend verification email" });
    }
  });
  app2.post("/api/auth/request-reset", authLimiter, async (req, res) => {
    try {
      const validation = requestResetSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }
      const { email } = validation.data;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "If that email exists, a password reset link has been sent" });
      }
      if (user.authType === "google") {
        return res.json({ message: "If that email exists, a password reset link has been sent" });
      }
      const resetToken = generateToken();
      const tokenExpiry = new Date(Date.now() + 15 * 60 * 1e3);
      await storage.setResetToken(user.id, resetToken, tokenExpiry);
      sendPasswordResetEmail(email, user.username, resetToken).catch((err) => {
        console.error("Failed to send password reset email:", err);
      });
      res.json({ message: "If that email exists, a password reset link has been sent" });
    } catch (error) {
      console.error("Password reset request error:", error);
      res.status(500).json({ error: "Failed to process password reset request" });
    }
  });
  app2.post("/api/auth/reset-password", authLimiter, async (req, res) => {
    try {
      const validation = resetPasswordSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }
      const { token, password } = validation.data;
      const user = await storage.getUserByResetToken(token);
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }
      if (user.resetTokenExpiry && /* @__PURE__ */ new Date() > user.resetTokenExpiry) {
        return res.status(400).json({ error: "Reset token has expired" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      await storage.resetPassword(user.id, passwordHash);
      res.json({ message: "Password reset successfully! You can now log in with your new password." });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });
  app2.get("/api/auth/google", (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(503).json({ error: "Google OAuth is not configured" });
    }
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const host = req.get("host");
    const callbackUrl = `${protocol}://${host}/api/auth/google/callback`;
    passport2.authenticate("google", {
      scope: ["profile", "email"],
      state: callbackUrl
      // Pass callback URL as state
    })(req, res, next);
  });
  app2.get(
    "/api/auth/google/callback",
    (req, res, next) => {
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.redirect("/login?error=oauth_not_configured");
      }
      passport2.authenticate("google", { failureRedirect: "/login" })(req, res, next);
    },
    (req, res) => {
      const user = req.user;
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.redirect("/login?error=session");
        }
        req.session.userId = user.id;
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return res.redirect("/login?error=session");
          }
          res.redirect("/");
        });
      });
    }
  );
  app2.get("/api/token", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const token = generateJWT({
        id: user.id,
        email: user.email,
        verified: user.verified
      });
      const refreshToken = generateRefreshToken({
        id: user.id,
        email: user.email
      });
      res.json({
        token,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRATION || "15m",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          verified: user.verified
        }
      });
    } catch (error) {
      console.error("Token generation error:", error);
      res.status(500).json({ error: "Failed to generate token" });
    }
  });
  app2.post("/api/token/refresh", async (req, res) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token required" });
      }
      const payload = verifyRefreshToken(refreshToken);
      if (!payload) {
        return res.status(401).json({ error: "Invalid or expired refresh token" });
      }
      const user = await storage.getUser(payload.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const newToken = generateJWT({
        id: user.id,
        email: user.email,
        verified: user.verified
      });
      res.json({
        token: newToken,
        expiresIn: process.env.JWT_EXPIRATION || "15m"
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(500).json({ error: "Failed to refresh token" });
    }
  });
  app2.get("/api/user", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  app2.post("/api/user/toggle-premium", requireAuth, async (req, res) => {
    try {
      const user = await storage.togglePremium(req.session.userId);
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle premium status" });
    }
  });
  app2.patch("/api/user/notifications", requireAuth, async (req, res) => {
    try {
      const user = await storage.updateNotificationPreferences(req.session.userId, req.body);
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to update notification preferences" });
    }
  });
  app2.post("/api/tutorial/complete", requireAuth, async (req, res) => {
    try {
      const { petName, petType } = req.body;
      if (!petName || !petType) {
        return res.status(400).json({ error: "Pet name and type are required" });
      }
      const result = await storage.completeTutorial(req.session.userId, petName, petType);
      const { passwordHash: _, ...userWithoutPassword } = result.user;
      res.json({
        user: userWithoutPassword,
        pet: result.pet
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to complete tutorial";
      if (errorMessage === "Tutorial already completed") {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  });
  app2.post("/api/tutorial/skip", requireAuth, async (req, res) => {
    try {
      const result = await storage.skipTutorial(req.session.userId);
      const { passwordHash: _, ...userWithoutPassword } = result.user;
      res.json({
        user: userWithoutPassword,
        pet: result.pet
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to skip tutorial";
      if (errorMessage === "Tutorial already completed") {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  });
  app2.post("/api/ads/watch-bonus", requireAuth, async (req, res) => {
    try {
      const result = await storage.watchAdBonus(req.session.userId);
      const { passwordHash: _, ...userWithoutPassword } = result.user;
      res.json({
        user: userWithoutPassword,
        coinsEarned: result.coinsEarned,
        adsRemaining: result.adsRemaining
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to watch ad";
      if (errorMessage === "Premium users cannot watch ads") {
        res.status(403).json({ error: errorMessage });
      } else if (errorMessage === "Daily ad limit reached") {
        res.status(429).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  });
  app2.post("/api/store/purchase", requireAuth, async (req, res) => {
    try {
      const { itemId, price } = req.body;
      if (!itemId || !price) {
        return res.status(400).json({ error: "Missing itemId or price" });
      }
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      let coinsToAdd = 0;
      if (itemId === "coin-pack-100") {
        coinsToAdd = 100;
      } else if (itemId === "coin-pack-500") {
        coinsToAdd = 500;
      } else if (itemId.includes("egg") || itemId.includes("booster")) {
        console.log(`Demo purchase: ${itemId} for user ${userId}`);
      }
      if (coinsToAdd > 0) {
        const MAX_COINS2 = 5e3;
        const newCoins = Math.min(user.coins + coinsToAdd, MAX_COINS2);
        const actualCoinsAdded = newCoins - user.coins;
        const updatedUser = await storage.updateUserCoins(userId, newCoins, user.gems);
        const { passwordHash: _2, ...userWithoutPassword2 } = updatedUser;
        return res.json({
          success: true,
          user: userWithoutPassword2,
          itemId,
          coinsAdded: actualCoinsAdded,
          message: `Demo purchase successful! Added ${actualCoinsAdded} coins.`
        });
      }
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json({
        success: true,
        user: userWithoutPassword,
        itemId,
        message: `Demo purchase successful! ${itemId} added to your account.`
      });
    } catch (error) {
      console.error("Store purchase error:", error);
      res.status(500).json({ error: "Failed to process purchase" });
    }
  });
  app2.get("/api/pet", requireAuth, async (req, res) => {
    try {
      let pet = await storage.getPetByUserId(req.session.userId);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }
      pet = await storage.applyStatDecay(pet.id);
      const newMood = calculateMood(pet.hunger, pet.happiness, pet.energy);
      if (newMood !== pet.mood) {
        pet = await storage.updatePetMood(pet.id, newMood);
      }
      res.json(pet);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pet" });
    }
  });
  app2.post("/api/pet/feed", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      let pet = await storage.getPetByUserId(userId);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }
      pet = await storage.applyStatDecay(pet.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const action = PET_ACTIONS.feed;
      const cooldownCheck = evaluateCooldown(pet.lastFed, action.cooldownMinutes);
      if (!cooldownCheck.ready) {
        return res.status(409).json({
          error: `You need to wait before feeding again`,
          code: "COOLDOWN_ACTIVE",
          remainingSeconds: cooldownCheck.remainingSeconds
        });
      }
      const result = await storage.performPetAction(userId, pet.id, "feed");
      res.json(result);
    } catch (error) {
      console.error("Feed error:", error);
      res.status(500).json({ error: "Failed to feed pet" });
    }
  });
  app2.post("/api/pet/play", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      let pet = await storage.getPetByUserId(userId);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }
      pet = await storage.applyStatDecay(pet.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const action = PET_ACTIONS.play;
      const cooldownCheck = evaluateCooldown(pet.lastPlayed, action.cooldownMinutes);
      if (!cooldownCheck.ready) {
        return res.status(409).json({
          error: `You need to wait before playing again`,
          code: "COOLDOWN_ACTIVE",
          remainingSeconds: cooldownCheck.remainingSeconds
        });
      }
      const result = await storage.performPetAction(userId, pet.id, "play");
      res.json(result);
    } catch (error) {
      console.error("Play error:", error);
      res.status(500).json({ error: "Failed to play with pet" });
    }
  });
  app2.post("/api/pet/clean", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      let pet = await storage.getPetByUserId(userId);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }
      pet = await storage.applyStatDecay(pet.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const action = PET_ACTIONS.clean;
      const cooldownCheck = evaluateCooldown(pet.lastCleaned, action.cooldownMinutes);
      if (!cooldownCheck.ready) {
        return res.status(409).json({
          error: `You need to wait before cleaning again`,
          code: "COOLDOWN_ACTIVE",
          remainingSeconds: cooldownCheck.remainingSeconds
        });
      }
      const result = await storage.performPetAction(userId, pet.id, "clean");
      res.json(result);
    } catch (error) {
      console.error("Clean error:", error);
      res.status(500).json({ error: "Failed to clean pet" });
    }
  });
  app2.post("/api/pet/sleep", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      let pet = await storage.getPetByUserId(userId);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }
      pet = await storage.applyStatDecay(pet.id);
      const result = await storage.performPetAction(userId, pet.id, "sleep");
      res.json(result);
    } catch (error) {
      console.error("Sleep error:", error);
      res.status(500).json({ error: "Failed to put pet to sleep" });
    }
  });
  app2.get("/api/pets", requireAuth, async (req, res) => {
    try {
      const pets2 = await storage.getAllPetsByUserId(req.session.userId);
      res.json(pets2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pets" });
    }
  });
  app2.post("/api/pets", requireAuth, async (req, res) => {
    try {
      const validation = createPetRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }
      const { name, type } = validation.data;
      const userId = req.session.userId;
      const existingPets = await storage.getAllPetsByUserId(userId);
      if (existingPets.length >= 20) {
        return res.status(400).json({ error: "Maximum of 20 pets reached" });
      }
      const randomStat = () => Math.floor(Math.random() * 41) + 60;
      const newPet = await storage.createPet({
        userId,
        name,
        type: type || "Fluffy",
        level: 1,
        xp: 0,
        hunger: randomStat(),
        happiness: randomStat(),
        energy: randomStat(),
        cleanliness: randomStat(),
        health: randomStat(),
        age: 0,
        evolutionStage: 1,
        mood: "happy"
      });
      res.json(newPet);
    } catch (error) {
      console.error("Pet creation error:", error);
      res.status(500).json({ error: "Failed to create pet" });
    }
  });
  app2.get("/api/shop", async (req, res) => {
    try {
      const items = await storage.getAllShopItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shop items" });
    }
  });
  app2.post("/api/shop/buy", requireAuth, async (req, res) => {
    try {
      const { itemId } = req.body;
      if (!itemId) {
        return res.status(400).json({ error: "Item ID required" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const item = await storage.getShopItem(itemId);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      if (user.coins < item.price) {
        return res.status(400).json({ error: "Not enough coins" });
      }
      await storage.updateUserCoins(user.id, user.coins - item.price, user.gems);
      await storage.addToInventory(user.id, itemId, 1);
      const updatedUser = await storage.getUser(user.id);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to purchase item" });
    }
  });
  app2.post("/api/inventory/use", requireAuth, async (req, res) => {
    try {
      const { itemId } = req.body;
      if (!itemId) {
        return res.status(400).json({ error: "Item ID required" });
      }
      const userId = req.session.userId;
      const item = await storage.getShopItem(itemId);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      const inventoryItem = await storage.useInventoryItem(userId, itemId);
      if (!inventoryItem) {
        return res.status(400).json({ error: "Item not in inventory" });
      }
      let pet = await storage.getPetByUserId(userId);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }
      const effects = JSON.parse(item.effect);
      const updatedStats = {};
      if (effects.hunger !== void 0) {
        updatedStats.hunger = Math.min(100, pet.hunger + effects.hunger);
      }
      if (effects.happiness !== void 0) {
        updatedStats.happiness = Math.min(100, pet.happiness + effects.happiness);
      }
      if (effects.energy !== void 0) {
        updatedStats.energy = Math.min(100, pet.energy + effects.energy);
      }
      if (effects.cleanliness !== void 0) {
        updatedStats.cleanliness = Math.min(100, pet.cleanliness + effects.cleanliness);
      }
      pet = await storage.updatePetStats(pet.id, updatedStats);
      res.json({ pet, inventory: await storage.getUserInventory(userId) });
    } catch (error) {
      res.status(500).json({ error: "Failed to use item" });
    }
  });
  app2.get("/api/inventory", requireAuth, async (req, res) => {
    try {
      const inventory2 = await storage.getUserInventory(req.session.userId);
      const enrichedInventory = await Promise.all(
        inventory2.map(async (invItem) => {
          const item = await storage.getShopItem(invItem.itemId);
          return { ...invItem, item };
        })
      );
      res.json(enrichedInventory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });
  app2.post("/api/daily-reward", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const now = /* @__PURE__ */ new Date();
      if (user.lastDailyReward) {
        const hoursSince = (now.getTime() - user.lastDailyReward.getTime()) / (1e3 * 60 * 60);
        if (hoursSince < 20) {
          return res.status(400).json({ error: "Daily reward already claimed" });
        }
      }
      const updatedUser = await storage.claimDailyReward(user.id);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to claim daily reward" });
    }
  });
  app2.post("/api/minigame/reward", requireAuth, async (req, res) => {
    try {
      const { score } = req.body;
      if (typeof score !== "number" || score < 0) {
        return res.status(400).json({ error: "Valid score required" });
      }
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      let pet = await storage.getPetByUserId(userId);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }
      const coinsEarned = Math.floor(score / 2);
      const xpEarned = Math.floor(score / 5);
      const happinessGained = Math.min(20, Math.floor(score / 10));
      await storage.updateUserCoins(user.id, user.coins + coinsEarned, user.gems);
      const xpResult = await storage.addPetXP(pet.id, xpEarned);
      pet = xpResult.pet;
      pet = await storage.updatePetStats(pet.id, {
        happiness: Math.min(100, pet.happiness + happinessGained)
      });
      res.json({ coinsEarned, happinessGained, xpEarned });
    } catch (error) {
      res.status(500).json({ error: "Failed to complete mini-game" });
    }
  });
  app2.get("/api/shop", requireAuth, async (req, res) => {
    try {
      const items = await storage.getAllShopItems();
      res.json(items);
    } catch (error) {
      console.error("Shop fetch error:", error);
      res.status(500).json({ error: "Failed to fetch shop items" });
    }
  });
  app2.post("/api/shop/purchase", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { itemId } = req.body;
      if (!itemId) {
        return res.status(400).json({ error: "Item ID is required" });
      }
      const result = await storage.purchaseItem(userId, itemId);
      res.json(result);
    } catch (error) {
      console.error("Purchase error:", error);
      if (error.message === "Insufficient coins") {
        return res.status(400).json({ error: "Not enough coins" });
      }
      if (error.message === "Shop item not found") {
        return res.status(404).json({ error: "Item not found" });
      }
      res.status(500).json({ error: "Failed to purchase item" });
    }
  });
  app2.get("/api/inventory", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const userInventory = await storage.getUserInventory(userId);
      res.json(userInventory);
    } catch (error) {
      console.error("Inventory fetch error:", error);
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });
  app2.post("/api/inventory/use", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { itemId } = req.body;
      if (!itemId) {
        return res.status(400).json({ error: "Item ID is required" });
      }
      let pet = await storage.getPetByUserId(userId);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }
      const item = await storage.getShopItem(itemId);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      const inventoryItem = await storage.useInventoryItem(userId, itemId);
      if (!inventoryItem) {
        return res.status(404).json({ error: "Item not in inventory or already used" });
      }
      const effects = JSON.parse(item.effect);
      const updates = {};
      for (const [stat, value] of Object.entries(effects)) {
        const currentValue = pet[stat];
        updates[stat] = Math.min(100, Math.max(0, currentValue + value));
      }
      pet = await storage.updatePetStats(pet.id, updates);
      res.json({ pet, itemUsed: item, remainingQuantity: inventoryItem.quantity });
    } catch (error) {
      console.error("Use item error:", error);
      res.status(500).json({ error: "Failed to use item" });
    }
  });
  app2.get("/api/leaderboard/highest-level", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const result = await storage.getLeaderboardByHighestLevelPet(userId);
      res.json(result);
    } catch (error) {
      console.error("Leaderboard (highest level) error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });
  app2.get("/api/leaderboard/most-pets", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const result = await storage.getLeaderboardByMostPets(userId);
      res.json(result);
    } catch (error) {
      console.error("Leaderboard (most pets) error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });
  app2.get("/api/leaderboard/total-coins", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const result = await storage.getLeaderboardByTotalCoins(userId);
      res.json(result);
    } catch (error) {
      console.error("Leaderboard (total coins) error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });
  app2.get("/api/challenges/daily", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const challenges2 = await storage.getDailyChallenges(userId);
      res.json(challenges2);
    } catch (error) {
      console.error("Get daily challenges error:", error);
      res.status(500).json({ error: "Failed to fetch daily challenges" });
    }
  });
  app2.post("/api/challenges/:id/claim", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const result = await storage.claimChallengeReward(userId, id);
      res.json(result);
    } catch (error) {
      console.error("Claim challenge reward error:", error);
      if (error.message === "Challenge not found") {
        return res.status(404).json({ error: error.message });
      } else if (error.message === "Challenge not completed") {
        return res.status(400).json({ error: error.message });
      } else if (error.message === "Reward already claimed") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to claim challenge reward" });
    }
  });
  const startBreedingSchema2 = z2.object({
    parent1Id: z2.string().min(1, "Parent 1 ID is required"),
    parent2Id: z2.string().min(1, "Parent 2 ID is required")
  }).refine((data) => data.parent1Id !== data.parent2Id, {
    message: "Cannot breed a pet with itself"
  });
  app2.post("/api/breeding/start", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const validation = startBreedingSchema2.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: validation.error.errors[0].message
        });
      }
      const { parent1Id, parent2Id } = validation.data;
      const breedingRecord = await storage.startBreeding(
        userId,
        parent1Id,
        parent2Id,
        false
        // Always use coins for now (prevent exploit)
      );
      res.json(breedingRecord);
    } catch (error) {
      console.error("Start breeding error:", error);
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      } else if (error.message.includes("Not enough coins")) {
        return res.status(400).json({ error: error.message });
      } else if (error.message.includes("only breed your own")) {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || "Failed to start breeding" });
    }
  });
  app2.get("/api/breeding", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const records = await storage.getBreedingRecords(userId);
      res.json(records);
    } catch (error) {
      console.error("Get breeding records error:", error);
      res.status(500).json({ error: "Failed to fetch breeding records" });
    }
  });
  app2.get("/api/eggs", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const eggs2 = await storage.getUserEggs(userId);
      res.json(eggs2);
    } catch (error) {
      console.error("Get eggs error:", error);
      res.status(500).json({ error: "Failed to fetch eggs" });
    }
  });
  app2.post("/api/eggs/:id/hatch", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const result = await storage.hatchEgg(userId, id);
      res.json(result);
    } catch (error) {
      console.error("Hatch egg error:", error);
      res.status(400).json({ error: error.message || "Failed to hatch egg" });
    }
  });
  const playMiniGameSchema = z2.object({
    score: z2.number().min(0, "Score cannot be negative").max(1e3, "Invalid score")
  });
  app2.get("/api/minigames", requireAuth, async (req, res) => {
    try {
      const games = await storage.getMiniGames();
      res.json(games);
    } catch (error) {
      console.error("Get mini-games error:", error);
      res.status(500).json({ error: "Failed to fetch mini-games" });
    }
  });
  app2.get("/api/minigames/sessions", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const sessions = await storage.getUserMiniGameSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Get game sessions error:", error);
      res.status(500).json({ error: "Failed to fetch game sessions" });
    }
  });
  app2.post("/api/minigames/:id/play", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const gameId = req.params.id;
      const validation = playMiniGameSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: validation.error.errors[0].message
        });
      }
      const { score } = validation.data;
      const games = await storage.getMiniGames();
      const game = games.find((g) => g.id === gameId);
      if (!game) {
        return res.status(404).json({ error: "Mini-game not found" });
      }
      const lastSession = await storage.getLastGameSession(userId, gameId);
      if (lastSession) {
        const timeSinceLastPlay = Date.now() - lastSession.playedAt.getTime();
        const cooldownMs = 36e5;
        if (timeSinceLastPlay < cooldownMs) {
          const remainingMs = cooldownMs - timeSinceLastPlay;
          const remainingMinutes = Math.ceil(remainingMs / 6e4);
          return res.status(429).json({
            error: `Cooldown active. Try again in ${remainingMinutes} minute(s).`,
            remainingMs
          });
        }
      }
      const minReward = 20;
      const maxReward = 50;
      const rewardRange = maxReward - minReward;
      const scorePercent = Math.min(score / 1e3, 1);
      const potentialCoins = Math.floor(minReward + rewardRange * scorePercent);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const MAX_COINS2 = 5e3;
      const newCoins = Math.min(user.coins + potentialCoins, MAX_COINS2);
      const actualCoinsAwarded = newCoins - user.coins;
      await storage.updateUserCoins(userId, newCoins, user.gems);
      const session2 = await storage.recordGameSession({
        userId,
        gameId,
        score,
        coinsEarned: actualCoinsAwarded
      });
      res.json({
        session: session2,
        coinsEarned: actualCoinsAwarded,
        newBalance: newCoins
      });
    } catch (error) {
      console.error("Play mini-game error:", error);
      res.status(500).json({ error: error.message || "Failed to play mini-game" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import postgres2 from "postgres";
var app = express2();
if (!process.env.SESSION_SECRET) {
  console.error("\u274C CRITICAL: SESSION_SECRET environment variable is not set!");
  console.error("   This is a security risk. Please set SESSION_SECRET in your environment.");
  process.exit(1);
}
app.set("trust proxy", true);
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.secure || req.headers["x-forwarded-proto"] === "https") {
      return next();
    }
    const httpsUrl = `https://${req.headers.host}${req.url}`;
    res.redirect(301, httpsUrl);
  });
}
var getSessionStore = () => {
  if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL) {
    try {
      const PgSession = pgSession(session);
      const sql2 = postgres2(process.env.DATABASE_URL);
      console.log("\u2705 Session store: PostgreSQL (persistent across restarts)");
      return new PgSession({
        pool: sql2,
        createTableIfMissing: true
      });
    } catch (error) {
      console.warn("\u26A0\uFE0F PostgreSQL session store failed, falling back to memory");
      console.warn("Error:", error instanceof Error ? error.message : String(error));
    }
  }
  console.log("\u2139\uFE0F Session store: Memory (sessions lost on server restart)");
  const MemoryStore = memorystore(session);
  return new MemoryStore({
    checkPeriod: 864e5
  });
};
var sessionStore = getSessionStore();
app.use(
  session({
    cookie: {
      maxAge: 864e5,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    },
    store: sessionStore,
    resave: false,
    secret: process.env.SESSION_SECRET || "toypetme-secret-key-change-in-production",
    saveUninitialized: false
  })
);
setupPassport();
app.use(passport3.initialize());
app.use(passport3.session());
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const PORT = parseInt(process.env.PORT || "5000", 10);
  if (!process.env.VERCEL) {
    server.listen({
      port: PORT,
      host: "0.0.0.0",
      reusePort: true
    }, () => {
      log(`serving on port ${PORT}`);
    });
  }
})();
var index_default = app;
export {
  index_default as default
};
