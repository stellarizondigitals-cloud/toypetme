import { 
  type User, 
  type InsertUser,
  type Pet,
  type InsertPet,
  type ShopItem,
  type InsertShopItem,
  type Inventory,
  type InsertInventory,
  type Challenge,
  type InsertChallenge,
  type UserChallenge,
  type InsertUserChallenge,
  PET_ACTIONS,
  type PetActionType,
  calculateStatDecay,
  DAILY_LOGIN_BONUS,
  MAX_COINS,
  SHOP_ITEMS,
  DAILY_CHALLENGES
} from "@shared/schema";
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, desc, sql as sqlOp, count, max, gte, lt } from "drizzle-orm";
import { users, pets, shopItems, inventory, challenges, userChallenges, calculateLevelAndEvolution } from "@shared/schema";

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
  togglePremium(userId: string): Promise<User>;
  watchAdBonus(userId: string): Promise<{ user: User; coinsEarned: number; adsRemaining: number }>;
  updateNotificationPreferences(userId: string, preferences: { 
    notificationsEnabled?: boolean;
    notifyHunger?: boolean;
    notifyHappiness?: boolean;
    notifyChallenges?: boolean;
    notifyEvolution?: boolean;
  }): Promise<User>;
  
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
  addPetXP(petId: string, xp: number): Promise<{ pet: Pet; leveledUp: boolean; evolved: boolean }>;
  performPetAction(userId: string, petId: string, actionType: PetActionType): Promise<{ 
    pet: Pet; 
    user: User; 
    cooldowns: Record<string, number>;
    leveledUp?: boolean;
    evolved?: boolean;
    newLevel?: number;
    newStage?: number;
  }>;
  applyStatDecay(petId: string): Promise<Pet>;
  
  // Shop & Inventory
  getAllShopItems(): Promise<ShopItem[]>;
  getShopItem(id: string): Promise<ShopItem | undefined>;
  getUserInventory(userId: string): Promise<Inventory[]>;
  addToInventory(userId: string, itemId: string, quantity: number): Promise<Inventory>;
  purchaseItem(userId: string, itemId: string): Promise<{ user: User; inventory: Inventory }>;
  useInventoryItem(userId: string, itemId: string): Promise<Inventory | undefined>;

  // Leaderboard
  getLeaderboardByHighestLevelPet(currentUserId: string): Promise<{ 
    leaderboard: Array<{ userId: string; username: string; maxLevel: number; petName: string; rank: number }>;
    currentUserRank: number | null;
  }>;
  getLeaderboardByMostPets(currentUserId: string): Promise<{ 
    leaderboard: Array<{ userId: string; username: string; petCount: number; rank: number }>;
    currentUserRank: number | null;
  }>;
  getLeaderboardByTotalCoins(currentUserId: string): Promise<{ 
    leaderboard: Array<{ userId: string; username: string; coins: number; rank: number }>;
    currentUserRank: number | null;
  }>;

  // Daily Challenges
  getDailyChallenges(userId: string): Promise<Array<UserChallenge & { challenge: Challenge }>>;
  updateChallengeProgress(userId: string, challengeType: string, incrementBy: number): Promise<void>;
  claimChallengeReward(userId: string, userChallengeId: string): Promise<{ user: User; challenge: UserChallenge & { challenge: Challenge } }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private pets: Map<string, Pet>;
  private shopItems: Map<string, ShopItem>;
  private inventory: Map<string, Inventory[]>;
  private challenges: Map<string, Challenge>;
  private userChallenges: Map<string, UserChallenge[]>;

  constructor() {
    this.users = new Map();
    this.pets = new Map();
    this.shopItems = new Map();
    this.inventory = new Map();
    this.challenges = new Map();
    this.userChallenges = new Map();
    this.initializeShopItems();
    this.initializeChallenges();
  }

  private initializeShopItems() {
    // Load canonical shop catalog (9 items across Food/Toys/Cosmetics)
    SHOP_ITEMS.forEach(item => this.shopItems.set(item.id, item));
  }

  private initializeChallenges() {
    // Load predefined challenges
    DAILY_CHALLENGES.forEach(challenge => this.challenges.set(challenge.id, challenge));
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

  async togglePremium(userId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    user.premium = !user.premium;
    this.users.set(userId, user);
    return user;
  }

  async watchAdBonus(userId: string): Promise<{ user: User; coinsEarned: number; adsRemaining: number }> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    // Premium users don't see ads
    if (user.premium) {
      throw new Error("Premium users cannot watch ads");
    }
    
    // Check if we need to reset daily ad count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastAdDate = user.lastAdDate ? new Date(user.lastAdDate) : null;
    const shouldReset = !lastAdDate || lastAdDate < today;
    
    if (shouldReset) {
      user.adsWatchedToday = 0;
      user.lastAdDate = new Date();
    }
    
    // Check daily limit (max 5 ads per day)
    const MAX_ADS_PER_DAY = 5;
    if (user.adsWatchedToday >= MAX_ADS_PER_DAY) {
      throw new Error("Daily ad limit reached");
    }
    
    // Award coins (50 coins per ad, respecting MAX_COINS cap)
    const AD_BONUS = 50;
    const newCoins = Math.min(user.coins + AD_BONUS, MAX_COINS);
    const coinsEarned = newCoins - user.coins;
    
    user.coins = newCoins;
    user.adsWatchedToday += 1;
    user.lastAdDate = new Date();
    
    this.users.set(userId, user);
    
    const adsRemaining = MAX_ADS_PER_DAY - user.adsWatchedToday;
    
    return { user, coinsEarned, adsRemaining };
  }

  async updateNotificationPreferences(userId: string, preferences: {
    notificationsEnabled?: boolean;
    notifyHunger?: boolean;
    notifyHappiness?: boolean;
    notifyChallenges?: boolean;
    notifyEvolution?: boolean;
  }): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    if (preferences.notificationsEnabled !== undefined) {
      user.notificationsEnabled = preferences.notificationsEnabled;
    }
    if (preferences.notifyHunger !== undefined) {
      user.notifyHunger = preferences.notifyHunger;
    }
    if (preferences.notifyHappiness !== undefined) {
      user.notifyHappiness = preferences.notifyHappiness;
    }
    if (preferences.notifyChallenges !== undefined) {
      user.notifyChallenges = preferences.notifyChallenges;
    }
    if (preferences.notifyEvolution !== undefined) {
      user.notifyEvolution = preferences.notifyEvolution;
    }
    
    this.users.set(userId, user);
    return user;
  }

  async updateUserCoins(userId: string, coins: number, gems: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    // Enforce MAX_COINS cap
    user.coins = Math.min(coins, MAX_COINS);
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
    
    const coinsEarned = DAILY_LOGIN_BONUS + (user.dailyStreak * 10);
    // Enforce MAX_COINS cap
    user.coins = Math.min(user.coins + coinsEarned, MAX_COINS);
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

  async addPetXP(petId: string, xpGain: number): Promise<{ pet: Pet; leveledUp: boolean; evolved: boolean }> {
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
      evolved: result.evolved,
    };
  }

  async performPetAction(userId: string, petId: string, actionType: PetActionType): Promise<{ 
    pet: Pet; 
    user: User; 
    cooldowns: Record<string, number>;
    leveledUp?: boolean;
    evolved?: boolean;
    newLevel?: number;
    newStage?: number;
  }> {
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
    
    // Add XP and track level/evolution
    const xpResult = await this.addPetXP(petId, action.xpReward);
    updatedPet = xpResult.pet;
    
    // Add coins reward
    const updatedUser = await this.updateUserCoins(userId, user.coins + action.coinReward, user.gems);
    
    // Update challenge progress
    await this.updateChallengeProgress(userId, actionType, 1);
    
    // Also update stat-based challenges with current stat values
    if (updatedPet.happiness >= 0) {
      await this.updateChallengeProgress(userId, 'happiness', updatedPet.happiness);
    }
    if (updatedPet.health >= 0) {
      await this.updateChallengeProgress(userId, 'health', updatedPet.health);
    }
    if (updatedPet.energy >= 0) {
      await this.updateChallengeProgress(userId, 'energy', updatedPet.energy);
    }
    
    // Calculate cooldowns
    const cooldowns: Record<string, number> = {
      feed: 0,
      play: 0,
      clean: 0,
      sleep: 0,
    };
    
    // Build response with evolution metadata
    const response: {
      pet: Pet;
      user: User;
      cooldowns: Record<string, number>;
      leveledUp?: boolean;
      evolved?: boolean;
      newLevel?: number;
      newStage?: number;
    } = {
      pet: updatedPet,
      user: updatedUser,
      cooldowns,
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

  async purchaseItem(userId: string, itemId: string): Promise<{ user: User; inventory: Inventory }> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const item = this.shopItems.get(itemId);
    if (!item) throw new Error("Shop item not found");
    
    if (user.coins < item.price) {
      throw new Error("Insufficient coins");
    }
    
    // Deduct coins
    const updatedUser = await this.updateUserCoins(userId, user.coins - item.price, user.gems);
    
    // Add to inventory
    const inventoryItem = await this.addToInventory(userId, itemId, 1);
    
    return { user: updatedUser, inventory: inventoryItem };
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

  // Leaderboard methods
  async getLeaderboardByHighestLevelPet(currentUserId: string): Promise<{ 
    leaderboard: Array<{ userId: string; username: string; maxLevel: number; petName: string; rank: number }>;
    currentUserRank: number | null;
  }> {
    const allPets = Array.from(this.pets.values());
    const userPetMap = new Map<string, { maxLevel: number; petName: string }>();

    // Find highest level pet for each user
    for (const pet of allPets) {
      const current = userPetMap.get(pet.userId);
      if (!current || pet.level > current.maxLevel) {
        userPetMap.set(pet.userId, { maxLevel: pet.level, petName: pet.name });
      }
    }

    // Create leaderboard entries
    const entries = Array.from(userPetMap.entries()).map(([userId, data]) => {
      const user = this.users.get(userId);
      return {
        userId,
        username: user?.username || 'Unknown',
        maxLevel: data.maxLevel,
        petName: data.petName,
      };
    });

    // Sort by level descending
    entries.sort((a, b) => b.maxLevel - a.maxLevel);

    // Add ranks
    const leaderboard = entries.slice(0, 50).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    // Find current user's rank
    const currentUserIndex = entries.findIndex(e => e.userId === currentUserId);
    const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : null;

    return { leaderboard, currentUserRank };
  }

  async getLeaderboardByMostPets(currentUserId: string): Promise<{ 
    leaderboard: Array<{ userId: string; username: string; petCount: number; rank: number }>;
    currentUserRank: number | null;
  }> {
    const allPets = Array.from(this.pets.values());
    const userPetCount = new Map<string, number>();

    // Count pets for each user
    for (const pet of allPets) {
      const count = userPetCount.get(pet.userId) || 0;
      userPetCount.set(pet.userId, count + 1);
    }

    // Create leaderboard entries
    const entries = Array.from(userPetCount.entries()).map(([userId, petCount]) => {
      const user = this.users.get(userId);
      return {
        userId,
        username: user?.username || 'Unknown',
        petCount,
      };
    });

    // Sort by pet count descending
    entries.sort((a, b) => b.petCount - a.petCount);

    // Add ranks
    const leaderboard = entries.slice(0, 50).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    // Find current user's rank
    const currentUserIndex = entries.findIndex(e => e.userId === currentUserId);
    const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : null;

    return { leaderboard, currentUserRank };
  }

  async getLeaderboardByTotalCoins(currentUserId: string): Promise<{ 
    leaderboard: Array<{ userId: string; username: string; coins: number; rank: number }>;
    currentUserRank: number | null;
  }> {
    // Get all users
    const allUsers = Array.from(this.users.values());

    // Create leaderboard entries
    const entries = allUsers.map(user => ({
      userId: user.id,
      username: user.username,
      coins: user.coins,
    }));

    // Sort by coins descending
    entries.sort((a, b) => b.coins - a.coins);

    // Add ranks
    const leaderboard = entries.slice(0, 50).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    // Find current user's rank
    const currentUserIndex = entries.findIndex(e => e.userId === currentUserId);
    const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : null;

    return { leaderboard, currentUserRank };
  }

  // Daily Challenges
  async getDailyChallenges(userId: string): Promise<Array<UserChallenge & { challenge: Challenge }>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get or create user challenges for today
    let userDailyChallenges = this.userChallenges.get(userId) || [];
    
    // Filter challenges assigned today and not claimed
    const todaysChallenges = userDailyChallenges.filter(uc => {
      const assignedDate = new Date(uc.assignedDate);
      assignedDate.setHours(0, 0, 0, 0);
      return assignedDate.getTime() === today.getTime();
    });

    // If no challenges for today or less than 3, assign new random ones
    if (todaysChallenges.length < 3) {
      const allChallengeIds = Array.from(this.challenges.keys());
      const existingIds = new Set(todaysChallenges.map(c => c.challengeId));
      
      // Get random challenges that haven't been assigned today
      const availableIds = allChallengeIds.filter(id => !existingIds.has(id));
      const shuffled = availableIds.sort(() => Math.random() - 0.5);
      const needed = 3 - todaysChallenges.length;
      const toAssign = shuffled.slice(0, needed);

      // Create new user challenges
      for (const challengeId of toAssign) {
        const newUserChallenge: UserChallenge = {
          id: randomUUID(),
          userId,
          challengeId,
          progress: 0,
          completed: false,
          claimed: false,
          assignedDate: today,
          completedAt: null,
          claimedAt: null,
        };
        todaysChallenges.push(newUserChallenge);
        userDailyChallenges.push(newUserChallenge);
      }

      this.userChallenges.set(userId, userDailyChallenges);
    }

    // Map to include challenge details
    return todaysChallenges.map(uc => {
      const challenge = this.challenges.get(uc.challengeId)!;
      return { ...uc, challenge };
    });
  }

  async updateChallengeProgress(userId: string, challengeType: string, incrementBy: number): Promise<void> {
    // Validate increment is non-negative
    if (incrementBy < 0) {
      throw new Error('Challenge progress increment cannot be negative');
    }

    const userDailyChallenges = this.userChallenges.get(userId) || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's challenges of this type
    const relevantChallenges = userDailyChallenges.filter(uc => {
      const challenge = this.challenges.get(uc.challengeId);
      if (!challenge || challenge.type !== challengeType) return false;
      
      const assignedDate = new Date(uc.assignedDate);
      assignedDate.setHours(0, 0, 0, 0);
      return assignedDate.getTime() === today.getTime() && !uc.completed;
    });

    // Update progress
    for (const uc of relevantChallenges) {
      const challenge = this.challenges.get(uc.challengeId)!;
      
      if (challengeType === 'happiness' || challengeType === 'health' || challengeType === 'energy') {
        // For stat-based challenges, set progress to current value (capped at target)
        uc.progress = Math.min(incrementBy, challenge.target);
      } else {
        // For action-based challenges, increment (capped at target)
        uc.progress = Math.min(uc.progress + incrementBy, challenge.target);
      }

      // Check if completed
      if (uc.progress >= challenge.target) {
        uc.completed = true;
        uc.completedAt = new Date();
      }
    }
  }

  async claimChallengeReward(userId: string, userChallengeId: string): Promise<{ user: User; challenge: UserChallenge & { challenge: Challenge } }> {
    const userDailyChallenges = this.userChallenges.get(userId) || [];
    const userChallenge = userDailyChallenges.find(uc => uc.id === userChallengeId);

    if (!userChallenge) {
      throw new Error('Challenge not found');
    }

    if (!userChallenge.completed) {
      throw new Error('Challenge not completed');
    }

    if (userChallenge.claimed) {
      throw new Error('Reward already claimed');
    }

    const challenge = this.challenges.get(userChallenge.challengeId)!;
    const user = this.users.get(userId)!;

    // Award coins and mark as claimed
    const newCoins = Math.min(user.coins + challenge.coinReward, MAX_COINS);
    user.coins = newCoins;
    userChallenge.claimed = true;
    userChallenge.claimedAt = new Date();

    return {
      user,
      challenge: { ...userChallenge, challenge },
    };
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
    this.initializeChallenges();
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
    // Enforce MAX_COINS cap
    const cappedCoins = Math.min(coins, MAX_COINS);
    const result = await this.db.update(users)
      .set({ coins: cappedCoins, gems })
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

    const streakBonus = Math.min(newStreak * 10, 100);
    const coinsReward = DAILY_LOGIN_BONUS + streakBonus;
    // Enforce MAX_COINS cap
    const newCoins = Math.min(user.coins + coinsReward, MAX_COINS);

    const result = await this.db.update(users)
      .set({
        coins: newCoins,
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

  async togglePremium(userId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const result = await this.db
      .update(users)
      .set({ premium: !user.premium })
      .where(eq(users.id, userId))
      .returning();
    
    return result[0];
  }

  async watchAdBonus(userId: string): Promise<{ user: User; coinsEarned: number; adsRemaining: number }> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    // Premium users don't see ads
    if (user.premium) {
      throw new Error("Premium users cannot watch ads");
    }
    
    // Check if we need to reset daily ad count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastAdDate = user.lastAdDate ? new Date(user.lastAdDate) : null;
    const shouldReset = !lastAdDate || lastAdDate < today;
    
    let adsWatchedToday = user.adsWatchedToday;
    if (shouldReset) {
      adsWatchedToday = 0;
    }
    
    // Check daily limit (max 5 ads per day)
    const MAX_ADS_PER_DAY = 5;
    if (adsWatchedToday >= MAX_ADS_PER_DAY) {
      throw new Error("Daily ad limit reached");
    }
    
    // Award coins (50 coins per ad, respecting MAX_COINS cap)
    const AD_BONUS = 50;
    const newCoins = Math.min(user.coins + AD_BONUS, MAX_COINS);
    const coinsEarned = newCoins - user.coins;
    
    const result = await this.db
      .update(users)
      .set({ 
        coins: newCoins,
        adsWatchedToday: adsWatchedToday + 1,
        lastAdDate: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    const adsRemaining = MAX_ADS_PER_DAY - (adsWatchedToday + 1);
    
    return { user: result[0], coinsEarned, adsRemaining };
  }

  async updateNotificationPreferences(userId: string, preferences: {
    notificationsEnabled?: boolean;
    notifyHunger?: boolean;
    notifyHappiness?: boolean;
    notifyChallenges?: boolean;
    notifyEvolution?: boolean;
  }): Promise<User> {
    const updateData: Partial<typeof users.$inferSelect> = {};
    
    if (preferences.notificationsEnabled !== undefined) {
      updateData.notificationsEnabled = preferences.notificationsEnabled;
    }
    if (preferences.notifyHunger !== undefined) {
      updateData.notifyHunger = preferences.notifyHunger;
    }
    if (preferences.notifyHappiness !== undefined) {
      updateData.notifyHappiness = preferences.notifyHappiness;
    }
    if (preferences.notifyChallenges !== undefined) {
      updateData.notifyChallenges = preferences.notifyChallenges;
    }
    if (preferences.notifyEvolution !== undefined) {
      updateData.notifyEvolution = preferences.notifyEvolution;
    }
    
    const result = await this.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    return result[0];
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

  async addPetXP(petId: string, xpGain: number): Promise<{ pet: Pet; leveledUp: boolean; evolved: boolean }> {
    const pet = await this.getPet(petId);
    if (!pet) throw new Error("Pet not found");
    
    const result = calculateLevelAndEvolution(pet.level, pet.xp, pet.evolutionStage, xpGain);
    
    // Atomic update: level, xp, evolutionStage in single query
    const updated = await this.db.update(pets)
      .set({
        level: result.newLevel,
        xp: result.newXP,
        evolutionStage: result.newStage,
      })
      .where(eq(pets.id, petId))
      .returning();
    
    if (!updated[0]) throw new Error("Failed to update pet");
    
    return {
      pet: updated[0],
      leveledUp: result.leveledUp,
      evolved: result.evolved,
    };
  }

  async performPetAction(userId: string, petId: string, actionType: PetActionType): Promise<{ 
    pet: Pet; 
    user: User; 
    cooldowns: Record<string, number>;
    leveledUp?: boolean;
    evolved?: boolean;
    newLevel?: number;
    newStage?: number;
  }> {
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
    
    // Add XP and track level/evolution
    const xpResult = await this.addPetXP(petId, action.xpReward);
    updatedPet = xpResult.pet;
    
    // Add coins reward
    const updatedUser = await this.updateUserCoins(userId, user.coins + action.coinReward, user.gems);
    
    // Update challenge progress
    await this.updateChallengeProgress(userId, actionType, 1);
    
    // Also update stat-based challenges with current stat values
    if (updatedPet.happiness >= 0) {
      await this.updateChallengeProgress(userId, 'happiness', updatedPet.happiness);
    }
    if (updatedPet.health >= 0) {
      await this.updateChallengeProgress(userId, 'health', updatedPet.health);
    }
    if (updatedPet.energy >= 0) {
      await this.updateChallengeProgress(userId, 'energy', updatedPet.energy);
    }
    
    // Calculate cooldowns
    const cooldowns: Record<string, number> = {
      feed: 0,
      play: 0,
      clean: 0,
      sleep: 0,
    };
    
    // Build response with evolution metadata
    const response: {
      pet: Pet;
      user: User;
      cooldowns: Record<string, number>;
      leveledUp?: boolean;
      evolved?: boolean;
      newLevel?: number;
      newStage?: number;
    } = {
      pet: updatedPet,
      user: updatedUser,
      cooldowns,
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

  async purchaseItem(userId: string, itemId: string): Promise<{ user: User; inventory: Inventory }> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const item = await this.getShopItem(itemId);
    if (!item) throw new Error("Shop item not found");
    
    if (user.coins < item.price) {
      throw new Error("Insufficient coins");
    }
    
    // Deduct coins
    const updatedUser = await this.updateUserCoins(userId, user.coins - item.price, user.gems);
    
    // Add to inventory
    const inventoryItem = await this.addToInventory(userId, itemId, 1);
    
    return { user: updatedUser, inventory: inventoryItem };
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

  // Leaderboard methods
  async getLeaderboardByHighestLevelPet(currentUserId: string): Promise<{ 
    leaderboard: Array<{ userId: string; username: string; maxLevel: number; petName: string; rank: number }>;
    currentUserRank: number | null;
  }> {
    // Get top 50 users by their highest level pet
    const results = await this.db
      .select({
        userId: pets.userId,
        username: users.username,
        maxLevel: max(pets.level).as('max_level'),
      })
      .from(pets)
      .innerJoin(users, eq(pets.userId, users.id))
      .groupBy(pets.userId, users.username)
      .orderBy(desc(sqlOp`max(${pets.level})`))
      .limit(50);

    // Get pet names for the top levels
    const leaderboard = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const maxLevel = Number(result.maxLevel ?? 0);
      
      // Find the pet with the max level for this user
      const topPet = await this.db
        .select()
        .from(pets)
        .where(and(
          eq(pets.userId, result.userId),
          eq(pets.level, maxLevel)
        ))
        .limit(1);
      
      leaderboard.push({
        userId: result.userId,
        username: result.username,
        maxLevel,
        petName: topPet[0]?.name || 'Unknown',
        rank: i + 1,
      });
    }

    // Find current user's rank efficiently using COUNT
    // First get the user's max level
    const currentUserPets = await this.db
      .select({
        maxLevel: max(pets.level).as('max_level'),
      })
      .from(pets)
      .where(eq(pets.userId, currentUserId))
      .groupBy(pets.userId);

    let currentUserRank: number | null = null;
    if (currentUserPets.length > 0) {
      const currentMaxLevel = Number(currentUserPets[0].maxLevel ?? 0);
      
      // Count how many users have a higher max level
      const higherRankedUsers = await this.db
        .select({
          userId: pets.userId,
          maxLevel: max(pets.level).as('max_level'),
        })
        .from(pets)
        .groupBy(pets.userId)
        .having(sqlOp`max(${pets.level}) > ${currentMaxLevel}`);
      
      currentUserRank = higherRankedUsers.length + 1;
    }

    return { leaderboard, currentUserRank };
  }

  async getLeaderboardByMostPets(currentUserId: string): Promise<{ 
    leaderboard: Array<{ userId: string; username: string; petCount: number; rank: number }>;
    currentUserRank: number | null;
  }> {
    // Get top 50 users by pet count
    const results = await this.db
      .select({
        userId: pets.userId,
        username: users.username,
        petCount: count(pets.id).as('pet_count'),
      })
      .from(pets)
      .innerJoin(users, eq(pets.userId, users.id))
      .groupBy(pets.userId, users.username)
      .orderBy(desc(count(pets.id)))
      .limit(50);

    const leaderboard = results.map((result, index) => ({
      userId: result.userId,
      username: result.username,
      petCount: Number(result.petCount ?? 0),
      rank: index + 1,
    }));

    // Find current user's rank efficiently using COUNT
    // First get the user's pet count
    const currentUserPetCount = await this.db
      .select({
        petCount: count(pets.id).as('pet_count'),
      })
      .from(pets)
      .where(eq(pets.userId, currentUserId));

    let currentUserRank: number | null = null;
    if (currentUserPetCount.length > 0) {
      const currentCount = Number(currentUserPetCount[0].petCount ?? 0);
      
      // Count how many users have more pets
      const higherRankedUsers = await this.db
        .select({
          userId: pets.userId,
          petCount: count(pets.id).as('pet_count'),
        })
        .from(pets)
        .groupBy(pets.userId)
        .having(sqlOp`count(${pets.id}) > ${currentCount}`);
      
      currentUserRank = higherRankedUsers.length + 1;
    }

    return { leaderboard, currentUserRank };
  }

  async getLeaderboardByTotalCoins(currentUserId: string): Promise<{ 
    leaderboard: Array<{ userId: string; username: string; coins: number; rank: number }>;
    currentUserRank: number | null;
  }> {
    // Get top 50 users by total coins
    const results = await this.db
      .select({
        userId: users.id,
        username: users.username,
        coins: users.coins,
      })
      .from(users)
      .orderBy(desc(users.coins))
      .limit(50);

    const leaderboard = results.map((result, index) => ({
      userId: result.userId,
      username: result.username,
      coins: Number(result.coins ?? 0),
      rank: index + 1,
    }));

    // Find current user's rank efficiently using COUNT
    // First get the current user's coins
    const currentUserData = await this.db
      .select({
        coins: users.coins,
      })
      .from(users)
      .where(eq(users.id, currentUserId))
      .limit(1);

    let currentUserRank: number | null = null;
    if (currentUserData.length > 0) {
      const currentCoins = Number(currentUserData[0].coins ?? 0);
      
      // Count how many users have more coins
      const higherRankedCount = await this.db
        .select({
          count: count(users.id).as('count'),
        })
        .from(users)
        .where(sqlOp`${users.coins} > ${currentCoins}`);
      
      const higherRanked = Number(higherRankedCount[0]?.count ?? 0);
      currentUserRank = higherRanked + 1;
    }

    return { leaderboard, currentUserRank };
  }

  // Daily Challenges
  async getDailyChallenges(userId: string): Promise<Array<UserChallenge & { challenge: Challenge }>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get user challenges assigned today
    const todaysChallenges = await this.db
      .select()
      .from(userChallenges)
      .where(and(
        eq(userChallenges.userId, userId),
        gte(userChallenges.assignedDate, today),
        lt(userChallenges.assignedDate, tomorrow)
      ));

    // If less than 3, assign new random ones
    if (todaysChallenges.length < 3) {
      // Get all available challenges
      const allChallenges = await this.db.select().from(challenges);
      const existingIds = new Set(todaysChallenges.map(c => c.challengeId));
      
      // Get random challenges that haven't been assigned today
      const availableChallenges = allChallenges.filter(c => !existingIds.has(c.id));
      const shuffled = availableChallenges.sort(() => Math.random() - 0.5);
      const needed = 3 - todaysChallenges.length;
      const toAssign = shuffled.slice(0, needed);

      // Create new user challenges
      for (const challenge of toAssign) {
        const [newUserChallenge] = await this.db
          .insert(userChallenges)
          .values({
            userId,
            challengeId: challenge.id,
            progress: 0,
            completed: false,
            claimed: false,
            assignedDate: today,
          })
          .returning();
        todaysChallenges.push(newUserChallenge);
      }
    }

    // Fetch challenge details for each user challenge
    const challengesWithDetails = await Promise.all(
      todaysChallenges.map(async (uc) => {
        const [challenge] = await this.db
          .select()
          .from(challenges)
          .where(eq(challenges.id, uc.challengeId))
          .limit(1);
        return { ...uc, challenge };
      })
    );

    return challengesWithDetails;
  }

  async updateChallengeProgress(userId: string, challengeType: string, incrementBy: number): Promise<void> {
    // Validate increment is non-negative
    if (incrementBy < 0) {
      throw new Error('Challenge progress increment cannot be negative');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find today's uncompleted challenges of this type
    const todaysChallenges = await this.db
      .select()
      .from(userChallenges)
      .where(and(
        eq(userChallenges.userId, userId),
        eq(userChallenges.completed, false),
        gte(userChallenges.assignedDate, today),
        lt(userChallenges.assignedDate, tomorrow)
      ));

    // Update progress for matching challenge types
    for (const uc of todaysChallenges) {
      const [challenge] = await this.db
        .select()
        .from(challenges)
        .where(eq(challenges.id, uc.challengeId))
        .limit(1);

      if (!challenge || challenge.type !== challengeType) continue;

      let newProgress = uc.progress;
      if (challengeType === 'happiness' || challengeType === 'health' || challengeType === 'energy') {
        // For stat-based challenges, set progress to current value (capped at target)
        newProgress = Math.min(incrementBy, challenge.target);
      } else {
        // For action-based challenges, increment (capped at target)
        newProgress = Math.min(uc.progress + incrementBy, challenge.target);
      }

      // Check if completed
      const isCompleted = newProgress >= challenge.target;
      
      await this.db
        .update(userChallenges)
        .set({
          progress: newProgress,
          completed: isCompleted,
          completedAt: isCompleted ? new Date() : uc.completedAt,
        })
        .where(eq(userChallenges.id, uc.id));
    }
  }

  async claimChallengeReward(userId: string, userChallengeId: string): Promise<{ user: User; challenge: UserChallenge & { challenge: Challenge } }> {
    // Use a transaction to ensure atomicity between claiming and coin award
    return await this.db.transaction(async (tx) => {
      // Atomic check and claim: Update only if completed=true AND claimed=false
      // This prevents double-claiming via race conditions
      const [updatedChallenge] = await tx
        .update(userChallenges)
        .set({ 
          claimed: true,
          claimedAt: new Date(),
        })
        .where(and(
          eq(userChallenges.id, userChallengeId),
          eq(userChallenges.userId, userId),
          eq(userChallenges.completed, true),
          eq(userChallenges.claimed, false)
        ))
        .returning();

      // If no row was updated, the challenge is either not found, not owned by user,
      // not completed, or already claimed
      if (!updatedChallenge) {
        // Fetch to provide specific error message
        const [userChallenge] = await tx
          .select()
          .from(userChallenges)
          .where(and(
            eq(userChallenges.id, userChallengeId),
            eq(userChallenges.userId, userId)
          ))
          .limit(1);

        if (!userChallenge) {
          throw new Error('Challenge not found');
        }
        if (!userChallenge.completed) {
          throw new Error('Challenge not completed');
        }
        if (userChallenge.claimed) {
          throw new Error('Reward already claimed');
        }
        throw new Error('Failed to claim reward');
      }

      // Get challenge details
      const [challenge] = await tx
        .select()
        .from(challenges)
        .where(eq(challenges.id, updatedChallenge.challengeId))
        .limit(1);

      if (!challenge) {
        throw new Error('Challenge template not found');
      }

      // Get user and update coins
      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      // Award coins (respecting MAX_COINS cap)
      const newCoins = Math.min(user.coins + challenge.coinReward, MAX_COINS);
      
      const [updatedUser] = await tx
        .update(users)
        .set({ coins: newCoins })
        .where(eq(users.id, userId))
        .returning();

      return {
        user: updatedUser,
        challenge: { ...updatedChallenge, challenge },
      };
    });
  }

  private async initializeChallenges() {
    const existing = await this.db.select().from(challenges);
    if (existing.length === 0) {
      await this.db.insert(challenges).values(DAILY_CHALLENGES);
    }
  }
}

// Use database storage for persistence across restarts
export const storage = new DbStorage();
