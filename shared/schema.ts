import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User profile with currency
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
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
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  hunger: integer("hunger").notNull().default(100),
  happiness: integer("happiness").notNull().default(100),
  energy: integer("energy").notNull().default(100),
  cleanliness: integer("cleanliness").notNull().default(100),
  mood: text("mood").notNull().default("happy"),
  lastUpdated: timestamp("last_updated").notNull().default(sql`now()`),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

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
});

export const insertPetSchema = createInsertSchema(pets).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
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

export type InsertPet = z.infer<typeof insertPetSchema>;
export type Pet = typeof pets.$inferSelect;

export type InsertShopItem = z.infer<typeof insertShopItemSchema>;
export type ShopItem = typeof shopItems.$inferSelect;

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;
