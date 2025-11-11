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
  dailyStreak: integer("daily_streak").notNull().default(0),
  lastDailyReward: timestamp("last_daily_reward"),
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
  evolutionStage: integer("evolution_stage").notNull().default(1), // 1=baby, 2=teen, 3=adult
  mood: text("mood").notNull().default("happy"),
  lastFed: timestamp("last_fed").default(sql`now()`),
  lastPlayed: timestamp("last_played").default(sql`now()`),
  lastCleaned: timestamp("last_cleaned").default(sql`now()`),
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

// Pet action configuration
export const PET_ACTIONS = {
  feed: {
    statIncrease: { hunger: 20 },
    coinCost: 10,
    cooldownMinutes: 5,
    xpReward: 5,
  },
  play: {
    statIncrease: { happiness: 15, energy: -10 },
    coinCost: 15,
    cooldownMinutes: 5,
    xpReward: 10,
  },
  clean: {
    statIncrease: { cleanliness: 25 },
    coinCost: 12,
    cooldownMinutes: 5,
    xpReward: 8,
  },
  sleep: {
    statIncrease: { energy: 30 },
    coinCost: 0,
    cooldownMinutes: 5,
    xpReward: 5,
  },
} as const;

export type PetActionType = keyof typeof PET_ACTIONS;
