import { 
  type User, 
  type InsertUser,
  type Pet,
  type InsertPet,
  type ShopItem,
  type InsertShopItem,
  type Inventory,
  type InsertInventory,
  PET_ACTIONS,
  type PetActionType,
  calculateStatDecay
} from "@shared/schema";
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and } from "drizzle-orm";
import { users, pets, shopItems, inventory } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUser(username: string, email: string, passwordHash: string | null, authType?: string): Promise<User>;
  updateUserCoins(userId: string, coins: number, gems: number): Promise<User>;
  claimDailyReward(userId: string): Promise<User>;
  setVerificationToken(userId: string, token: string, expiry: Date): Promise<User>;
  verifyUser(userId: string): Promise<User>;
  setResetToken(userId: string, token: string, expiry: Date): Promise<User>;
  resetPassword(userId: string, passwordHash: string): Promise<User>;
  updateUserAuthType(userId: string, authType: string): Promise<User>;
  markEmailVerified(userId: string): Promise<User>;
  
  // Pet operations
  getPet(id: string): Promise<Pet | undefined>;
  getPetByUserId(userId: string): Promise<Pet | undefined>;
  getAllPetsByUserId(userId: string): Promise<Pet[]>;
  createPet(pet: InsertPet): Promise<Pet>;
  updatePetStats(
    petId: string, 
    stats: { hunger?: number; happiness?: number; energy?: number; cleanliness?: number },
    timestamps?: { lastFed?: Date; lastPlayed?: Date; lastCleaned?: Date }
  ): Promise<Pet>;
  updatePetMood(petId: string, mood: string): Promise<Pet>;
  addPetXP(petId: string, xp: number): Promise<Pet>;
  performPetAction(userId: string, petId: string, actionType: PetActionType): Promise<{ pet: Pet; user: User; cooldowns: Record<string, number> }>;
  applyStatDecay(petId: string): Promise<Pet>;
  
  // Shop & Inventory
  getAllShopItems(): Promise<ShopItem[]>;
  getShopItem(id: string): Promise<ShopItem | undefined>;
  getUserInventory(userId: string): Promise<Inventory[]>;
  addToInventory(userId: string, itemId: string, quantity: number): Promise<Inventory>;
  useInventoryItem(userId: string, itemId: string): Promise<Inventory | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private pets: Map<string, Pet>;
  private shopItems: Map<string, ShopItem>;
  private inventory: Map<string, Inventory[]>;

  constructor() {
    this.users = new Map();
    this.pets = new Map();
    this.shopItems = new Map();
    this.inventory = new Map();
    this.initializeShopItems();
  }

  private initializeShopItems() {
    const items: ShopItem[] = [
      {
        id: randomUUID(),
        name: "Basic Food",
        description: "Fills your pet's belly",
        category: "food",
        price: 10,
        effect: JSON.stringify({ hunger: 25 }),
        image: null,
      },
      {
        id: randomUUID(),
        name: "Premium Food",
        description: "Delicious meal that makes pets happy",
        category: "food",
        price: 25,
        effect: JSON.stringify({ hunger: 40, happiness: 10 }),
        image: null,
      },
      {
        id: randomUUID(),
        name: "Ball Toy",
        description: "A fun toy to play with",
        category: "toy",
        price: 30,
        effect: JSON.stringify({ happiness: 20, energy: -5 }),
        image: null,
      },
      {
        id: randomUUID(),
        name: "Energy Drink",
        description: "Restores pet's energy",
        category: "food",
        price: 20,
        effect: JSON.stringify({ energy: 35 }),
        image: null,
      },
    ];
    items.forEach(item => this.shopItems.set(item.id, item));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.verificationToken === token,
    );
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.resetToken === token,
    );
  }

  async createUser(username: string, email: string, passwordHash: string | null, authType: string = "local"): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      id,
      username,
      email,
      passwordHash,
      verified: authType === "google", // Google users are auto-verified
      authType,
      verificationToken: null,
      verificationTokenExpiry: null,
      resetToken: null,
      resetTokenExpiry: null,
      coins: 100,
      gems: 0,
      dailyStreak: 0,
      lastDailyReward: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async setVerificationToken(userId: string, token: string, expiry: Date): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    user.verificationToken = token;
    user.verificationTokenExpiry = expiry;
    this.users.set(userId, user);
    return user;
  }

  async verifyUser(userId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    user.verified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    this.users.set(userId, user);
    return user;
  }

  async setResetToken(userId: string, token: string, expiry: Date): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    this.users.set(userId, user);
    return user;
  }

  async resetPassword(userId: string, passwordHash: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    user.passwordHash = passwordHash;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    this.users.set(userId, user);
    return user;
  }

  async updateUserAuthType(userId: string, authType: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    user.authType = authType;
    this.users.set(userId, user);
    return user;
  }

  async markEmailVerified(userId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    user.verified = true;
    this.users.set(userId, user);
    return user;
  }

  async updateUserCoins(userId: string, coins: number, gems: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    user.coins = coins;
    user.gems = gems;
    this.users.set(userId, user);
    return user;
  }

  async claimDailyReward(userId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const now = new Date();
    const lastReward = user.lastDailyReward;
    
    if (lastReward) {
      const hoursSince = (now.getTime() - lastReward.getTime()) / (1000 * 60 * 60);
      // Increment streak if claimed within 20-48 hours (maintains streak)
      if (hoursSince >= 20 && hoursSince <= 48) {
        user.dailyStreak += 1;
      } 
      // Reset streak if more than 48 hours have passed
      else if (hoursSince > 48) {
        user.dailyStreak = 1;
      }
      // If less than 20 hours, API should reject this before we get here
    } else {
      // First time claiming
      user.dailyStreak = 1;
    }
    
    const coinsEarned = 50 + (user.dailyStreak * 10);
    user.coins += coinsEarned;
    user.lastDailyReward = now;
    this.users.set(userId, user);
    return user;
  }

  // Pet methods
  async getPet(id: string): Promise<Pet | undefined> {
    return this.pets.get(id);
  }

  async getPetByUserId(userId: string): Promise<Pet | undefined> {
    return Array.from(this.pets.values()).find(pet => pet.userId === userId);
  }

  async getAllPetsByUserId(userId: string): Promise<Pet[]> {
    return Array.from(this.pets.values()).filter(pet => pet.userId === userId);
  }

  async createPet(insertPet: InsertPet): Promise<Pet> {
    const id = randomUUID();
    const now = new Date();
    const pet: Pet = {
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
    };
    this.pets.set(id, pet);
    return pet;
  }

  async updatePetStats(
    petId: string,
    stats: { hunger?: number; happiness?: number; energy?: number; cleanliness?: number },
    timestamps?: { lastFed?: Date; lastPlayed?: Date; lastCleaned?: Date }
  ): Promise<Pet> {
    const pet = this.pets.get(petId);
    if (!pet) throw new Error("Pet not found");
    
    if (stats.hunger !== undefined) pet.hunger = Math.max(0, Math.min(100, stats.hunger));
    if (stats.happiness !== undefined) pet.happiness = Math.max(0, Math.min(100, stats.happiness));
    if (stats.energy !== undefined) pet.energy = Math.max(0, Math.min(100, stats.energy));
    if (stats.cleanliness !== undefined) pet.cleanliness = Math.max(0, Math.min(100, stats.cleanliness));
    
    if (timestamps?.lastFed) pet.lastFed = timestamps.lastFed;
    if (timestamps?.lastPlayed) pet.lastPlayed = timestamps.lastPlayed;
    if (timestamps?.lastCleaned) pet.lastCleaned = timestamps.lastCleaned;
    
    pet.lastUpdated = new Date();
    this.pets.set(petId, pet);
    return pet;
  }

  async updatePetMood(petId: string, mood: string): Promise<Pet> {
    const pet = this.pets.get(petId);
    if (!pet) throw new Error("Pet not found");
    pet.mood = mood;
    this.pets.set(petId, pet);
    return pet;
  }

  async addPetXP(petId: string, xp: number): Promise<Pet> {
    const pet = this.pets.get(petId);
    if (!pet) throw new Error("Pet not found");
    
    pet.xp += xp;
    const xpForNextLevel = pet.level * 100;
    if (pet.xp >= xpForNextLevel) {
      pet.level += 1;
      pet.xp -= xpForNextLevel;
    }
    
    this.pets.set(petId, pet);
    return pet;
  }

  async performPetAction(userId: string, petId: string, actionType: PetActionType): Promise<{ pet: Pet; user: User; cooldowns: Record<string, number> }> {
    const pet = this.pets.get(petId);
    if (!pet) throw new Error("Pet not found");
    if (pet.userId !== userId) throw new Error("Unauthorized");
    
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const action = PET_ACTIONS[actionType];
    if (!action) throw new Error("Invalid action type");
    
    // Apply stat deltas
    const now = new Date();
    const stats: any = {};
    const timestamps: any = {};
    
    for (const [stat, delta] of Object.entries(action.statIncrease)) {
      stats[stat] = pet[stat as keyof Pet] as number + delta;
    }
    
    // Set action timestamp
    if (actionType === 'feed') timestamps.lastFed = now;
    else if (actionType === 'play') timestamps.lastPlayed = now;
    else if (actionType === 'clean') timestamps.lastCleaned = now;
    
    // Update pet stats and timestamp
    let updatedPet = await this.updatePetStats(petId, stats, timestamps);
    
    // Add XP
    updatedPet = await this.addPetXP(petId, action.xpReward);
    
    // Deduct coins
    const updatedUser = await this.updateUserCoins(userId, user.coins - action.coinCost, user.gems);
    
    // Calculate cooldowns
    const cooldowns: Record<string, number> = {
      feed: 0,
      play: 0,
      clean: 0,
      sleep: 0,
    };
    
    return { pet: updatedPet, user: updatedUser, cooldowns };
  }

  async applyStatDecay(petId: string): Promise<Pet> {
    const pet = this.pets.get(petId);
    if (!pet) throw new Error("Pet not found");
    
    // Calculate new stats based on time elapsed (per-stat timestamps)
    const decayedStats = calculateStatDecay(pet);
    
    // Update pet with new stats and timestamps
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
  async getAllShopItems(): Promise<ShopItem[]> {
    return Array.from(this.shopItems.values());
  }

  async getShopItem(id: string): Promise<ShopItem | undefined> {
    return this.shopItems.get(id);
  }

  async getUserInventory(userId: string): Promise<Inventory[]> {
    return this.inventory.get(userId) || [];
  }

  async addToInventory(userId: string, itemId: string, quantity: number): Promise<Inventory> {
    const userInv = this.inventory.get(userId) || [];
    const existing = userInv.find(inv => inv.itemId === itemId);
    
    if (existing) {
      existing.quantity += quantity;
      this.inventory.set(userId, userInv);
      return existing;
    } else {
      const newInv: Inventory = {
        id: randomUUID(),
        userId,
        itemId,
        quantity,
      };
      userInv.push(newInv);
      this.inventory.set(userId, userInv);
      return newInv;
    }
  }

  async useInventoryItem(userId: string, itemId: string): Promise<Inventory | undefined> {
    const userInv = this.inventory.get(userId) || [];
    const item = userInv.find(inv => inv.itemId === itemId);
    
    if (!item || item.quantity <= 0) return undefined;
    
    item.quantity -= 1;
    if (item.quantity === 0) {
      const filtered = userInv.filter(inv => inv.itemId !== itemId);
      this.inventory.set(userId, filtered);
    } else {
      this.inventory.set(userId, userInv);
    }
    
    return item;
  }
}

// Database Storage Implementation
export class DbStorage implements IStorage {
  private db;

  constructor() {
    const connectionString = process.env.DATABASE_URL!;
    const sql = neon(connectionString);
    this.db = drizzle(sql);
    this.initializeShopItems();
  }

  private async initializeShopItems() {
    const existing = await this.db.select().from(shopItems);
    if (existing.length === 0) {
      const items: InsertShopItem[] = [
        {
          name: "Basic Food",
          description: "Fills your pet's belly",
          category: "food",
          price: 10,
          effect: JSON.stringify({ hunger: 25 }),
          image: null,
        },
        {
          name: "Premium Food",
          description: "Delicious premium meal",
          category: "food",
          price: 25,
          effect: JSON.stringify({ hunger: 50 }),
          image: null,
        },
        {
          name: "Ball",
          description: "A fun toy for your pet",
          category: "toy",
          price: 15,
          effect: JSON.stringify({ happiness: 30 }),
          image: null,
        },
        {
          name: "Chew Toy",
          description: "Keeps your pet entertained",
          category: "toy",
          price: 20,
          effect: JSON.stringify({ happiness: 40 }),
          image: null,
        },
        {
          name: "Energy Drink",
          description: "Restores your pet's energy",
          category: "food",
          price: 30,
          effect: JSON.stringify({ energy: 50 }),
          image: null,
        },
        {
          name: "Soap",
          description: "Cleans your pet",
          category: "cleaning",
          price: 12,
          effect: JSON.stringify({ cleanliness: 40 }),
          image: null,
        },
      ];
      await this.db.insert(shopItems).values(items);
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(
      and(
        eq(users.verificationToken, token),
        eq(users.verified, false)
      )
    );
    if (result.length === 0) return undefined;
    const user = result[0];
    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
      return undefined;
    }
    return user;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.resetToken, token));
    if (result.length === 0) return undefined;
    const user = result[0];
    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
      return undefined;
    }
    return user;
  }

  async createUser(username: string, email: string, passwordHash: string | null, authType: string = "local"): Promise<User> {
    const result = await this.db.insert(users).values({
      username,
      email,
      passwordHash,
      authType,
    }).returning();
    return result[0];
  }

  async updateUserCoins(userId: string, coins: number, gems: number): Promise<User> {
    const result = await this.db.update(users)
      .set({ coins, gems })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async claimDailyReward(userId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const now = new Date();
    const lastReward = user.lastDailyReward;
    let newStreak = 1;

    if (lastReward) {
      const hoursSince = (now.getTime() - lastReward.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        throw new Error("Already claimed today");
      }
      if (hoursSince < 48) {
        newStreak = user.dailyStreak + 1;
      }
    }

    const baseReward = 50;
    const streakBonus = Math.min(newStreak * 10, 100);
    const coinsReward = baseReward + streakBonus;

    const result = await this.db.update(users)
      .set({
        coins: user.coins + coinsReward,
        dailyStreak: newStreak,
        lastDailyReward: now,
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async setVerificationToken(userId: string, token: string, expiry: Date): Promise<User> {
    const result = await this.db.update(users)
      .set({
        verificationToken: token,
        verificationTokenExpiry: expiry,
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async verifyUser(userId: string): Promise<User> {
    const result = await this.db.update(users)
      .set({
        verified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async setResetToken(userId: string, token: string, expiry: Date): Promise<User> {
    const result = await this.db.update(users)
      .set({
        resetToken: token,
        resetTokenExpiry: expiry,
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async resetPassword(userId: string, passwordHash: string): Promise<User> {
    const result = await this.db.update(users)
      .set({
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async updateUserAuthType(userId: string, authType: string): Promise<User> {
    const result = await this.db.update(users)
      .set({ authType })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async markEmailVerified(userId: string): Promise<User> {
    return this.verifyUser(userId);
  }

  // Pet operations
  async getPet(id: string): Promise<Pet | undefined> {
    const result = await this.db.select().from(pets).where(eq(pets.id, id));
    return result[0];
  }

  async getPetByUserId(userId: string): Promise<Pet | undefined> {
    const result = await this.db.select().from(pets).where(eq(pets.userId, userId));
    return result[0];
  }

  async getAllPetsByUserId(userId: string): Promise<Pet[]> {
    return await this.db.select().from(pets).where(eq(pets.userId, userId));
  }

  async createPet(pet: InsertPet): Promise<Pet> {
    const result = await this.db.insert(pets).values(pet).returning();
    return result[0];
  }

  async updatePetStats(
    petId: string,
    stats: { hunger?: number; happiness?: number; energy?: number; cleanliness?: number },
    timestamps?: { lastFed?: Date; lastPlayed?: Date; lastCleaned?: Date }
  ): Promise<Pet> {
    const result = await this.db.update(pets)
      .set({ ...stats, ...timestamps, lastUpdated: new Date() })
      .where(eq(pets.id, petId))
      .returning();
    return result[0];
  }

  async updatePetMood(petId: string, mood: string): Promise<Pet> {
    const result = await this.db.update(pets)
      .set({ mood })
      .where(eq(pets.id, petId))
      .returning();
    return result[0];
  }

  async addPetXP(petId: string, xp: number): Promise<Pet> {
    const pet = await this.getPet(petId);
    if (!pet) throw new Error("Pet not found");

    const newXP = pet.xp + xp;
    let newLevel = pet.level;
    let remainingXP = newXP;

    while (remainingXP >= newLevel * 100) {
      remainingXP -= newLevel * 100;
      newLevel++;
    }

    const result = await this.db.update(pets)
      .set({ xp: remainingXP, level: newLevel })
      .where(eq(pets.id, petId))
      .returning();
    return result[0];
  }

  async performPetAction(userId: string, petId: string, actionType: PetActionType): Promise<{ pet: Pet; user: User; cooldowns: Record<string, number> }> {
    const pet = await this.getPet(petId);
    if (!pet) throw new Error("Pet not found");
    if (pet.userId !== userId) throw new Error("Unauthorized");
    
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const action = PET_ACTIONS[actionType];
    if (!action) throw new Error("Invalid action type");
    
    // Apply stat deltas
    const now = new Date();
    const stats: any = {};
    const timestamps: any = {};
    
    for (const [stat, delta] of Object.entries(action.statIncrease)) {
      const currentValue = pet[stat as keyof Pet] as number;
      stats[stat] = Math.max(0, Math.min(100, currentValue + delta));
    }
    
    // Set action timestamp
    if (actionType === 'feed') timestamps.lastFed = now;
    else if (actionType === 'play') timestamps.lastPlayed = now;
    else if (actionType === 'clean') timestamps.lastCleaned = now;
    
    // Update pet stats and timestamp
    let updatedPet = await this.updatePetStats(petId, stats, timestamps);
    
    // Add XP
    updatedPet = await this.addPetXP(petId, action.xpReward);
    
    // Deduct coins
    const updatedUser = await this.updateUserCoins(userId, user.coins - action.coinCost, user.gems);
    
    // Calculate cooldowns
    const cooldowns: Record<string, number> = {
      feed: 0,
      play: 0,
      clean: 0,
      sleep: 0,
    };
    
    return { pet: updatedPet, user: updatedUser, cooldowns };
  }

  async applyStatDecay(petId: string): Promise<Pet> {
    const pet = await this.getPet(petId);
    if (!pet) throw new Error("Pet not found");
    
    // Calculate new stats based on time elapsed (per-stat timestamps)
    const decayedStats = calculateStatDecay(pet);
    
    // Update pet with new stats in a single atomic database update
    const result = await this.db.update(pets)
      .set({
        hunger: decayedStats.hunger,
        happiness: decayedStats.happiness,
        cleanliness: decayedStats.cleanliness,
        health: decayedStats.health,
        isSick: decayedStats.isSick,
        lastHungerDecay: decayedStats.newLastHungerDecay,
        lastHappinessDecay: decayedStats.newLastHappinessDecay,
        lastCleanlinessDecay: decayedStats.newLastCleanlinessDecay,
        lastHealthDecay: decayedStats.newLastHealthDecay,
        lastUpdated: new Date(),
      })
      .where(eq(pets.id, petId))
      .returning();
    
    return result[0];
  }

  // Shop & Inventory
  async getAllShopItems(): Promise<ShopItem[]> {
    return await this.db.select().from(shopItems);
  }

  async getShopItem(id: string): Promise<ShopItem | undefined> {
    const result = await this.db.select().from(shopItems).where(eq(shopItems.id, id));
    return result[0];
  }

  async getUserInventory(userId: string): Promise<Inventory[]> {
    return await this.db.select().from(inventory).where(eq(inventory.userId, userId));
  }

  async addToInventory(userId: string, itemId: string, quantity: number): Promise<Inventory> {
    const existing = await this.db.select().from(inventory).where(
      and(
        eq(inventory.userId, userId),
        eq(inventory.itemId, itemId)
      )
    );

    if (existing.length > 0) {
      const result = await this.db.update(inventory)
        .set({ quantity: existing[0].quantity + quantity })
        .where(eq(inventory.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      const result = await this.db.insert(inventory)
        .values({ userId, itemId, quantity })
        .returning();
      return result[0];
    }
  }

  async useInventoryItem(userId: string, itemId: string): Promise<Inventory | undefined> {
    const existing = await this.db.select().from(inventory).where(
      and(
        eq(inventory.userId, userId),
        eq(inventory.itemId, itemId)
      )
    );

    if (existing.length === 0 || existing[0].quantity <= 0) return undefined;

    const newQuantity = existing[0].quantity - 1;

    if (newQuantity === 0) {
      await this.db.delete(inventory).where(eq(inventory.id, existing[0].id));
      return { ...existing[0], quantity: 0 };
    } else {
      const result = await this.db.update(inventory)
        .set({ quantity: newQuantity })
        .where(eq(inventory.id, existing[0].id))
        .returning();
      return result[0];
    }
  }
}

// Use database storage for persistence across restarts
export const storage = new DbStorage();
