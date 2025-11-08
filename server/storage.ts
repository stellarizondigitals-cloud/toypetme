import { 
  type User, 
  type InsertUser,
  type Pet,
  type InsertPet,
  type ShopItem,
  type Inventory,
  type InsertInventory
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(username: string, email: string, passwordHash: string): Promise<User>;
  updateUserCoins(userId: string, coins: number, gems: number): Promise<User>;
  claimDailyReward(userId: string): Promise<User>;
  
  // Pet operations
  getPet(id: string): Promise<Pet | undefined>;
  getPetByUserId(userId: string): Promise<Pet | undefined>;
  createPet(pet: InsertPet): Promise<Pet>;
  updatePetStats(
    petId: string, 
    stats: { hunger?: number; happiness?: number; energy?: number; cleanliness?: number }
  ): Promise<Pet>;
  updatePetMood(petId: string, mood: string): Promise<Pet>;
  addPetXP(petId: string, xp: number): Promise<Pet>;
  
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

  async createUser(username: string, email: string, passwordHash: string): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      id,
      username,
      email,
      passwordHash,
      coins: 100,
      gems: 0,
      dailyStreak: 0,
      lastDailyReward: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
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

  async createPet(insertPet: InsertPet): Promise<Pet> {
    const id = randomUUID();
    const pet: Pet = {
      id,
      userId: insertPet.userId,
      name: insertPet.name,
      level: insertPet.level ?? 1,
      xp: insertPet.xp ?? 0,
      hunger: insertPet.hunger ?? 100,
      happiness: insertPet.happiness ?? 100,
      energy: insertPet.energy ?? 100,
      cleanliness: insertPet.cleanliness ?? 100,
      mood: insertPet.mood ?? "happy",
      lastUpdated: new Date(),
      createdAt: new Date(),
    };
    this.pets.set(id, pet);
    return pet;
  }

  async updatePetStats(
    petId: string,
    stats: { hunger?: number; happiness?: number; energy?: number; cleanliness?: number }
  ): Promise<Pet> {
    const pet = this.pets.get(petId);
    if (!pet) throw new Error("Pet not found");
    
    if (stats.hunger !== undefined) pet.hunger = Math.max(0, Math.min(100, stats.hunger));
    if (stats.happiness !== undefined) pet.happiness = Math.max(0, Math.min(100, stats.happiness));
    if (stats.energy !== undefined) pet.energy = Math.max(0, Math.min(100, stats.energy));
    if (stats.cleanliness !== undefined) pet.cleanliness = Math.max(0, Math.min(100, stats.cleanliness));
    
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

export const storage = new MemStorage();
