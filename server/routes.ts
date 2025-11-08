import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPetSchema, signupSchema, loginSchema, type User } from "@shared/schema";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper function to calculate stat decay
  const applyStatDecay = (pet: any) => {
    const now = new Date();
    const lastUpdated = new Date(pet.lastUpdated);
    const hoursPassed = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
    
    // Stats decay by 5 points per hour
    const decayAmount = Math.floor(hoursPassed * 5);
    
    return {
      ...pet,
      hunger: Math.max(0, pet.hunger - decayAmount),
      happiness: Math.max(0, pet.happiness - decayAmount),
      energy: Math.max(0, pet.energy - decayAmount),
      cleanliness: Math.max(0, pet.cleanliness - Math.floor(decayAmount * 0.5)), // Decays slower
    };
  };

  const calculateMood = (hunger: number, happiness: number, energy: number): string => {
    if (hunger < 20 || happiness < 20 || energy < 20) return "sad";
    if (hunger > 70 && happiness > 70 && energy > 70) return "happy";
    if (energy < 30) return "sleeping";
    return "neutral";
  };

  // Middleware to check if user is authenticated
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    next();
  };

  // ===== AUTHENTICATION ROUTES =====
  
  // Signup
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validation = signupSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const { username, email, password } = validation.data;

      // Check if user already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user (local auth type)
      const user = await storage.createUser(username, email, passwordHash, "local");

      // Create default pet for the user
      await storage.createPet({
        userId: user.id,
        name: "Fluffy",
      });

      // Regenerate session to prevent session fixation attacks
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ error: "Failed to create session" });
        }

        // Set session
        req.session.userId = user.id;

        // Save session before sending response
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return res.status(500).json({ error: "Failed to save session" });
          }

          // Return user without password
          const { passwordHash: _, ...userWithoutPassword } = user;
          res.json(userWithoutPassword);
        });
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const { email, password } = validation.data;

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Regenerate session to prevent session fixation attacks
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ error: "Failed to create session" });
        }

        // Set session
        req.session.userId = user.id;

        // Save session before sending response
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return res.status(500).json({ error: "Failed to save session" });
          }

          // Return user without password
          const { passwordHash: _, ...userWithoutPassword } = user;
          res.json(userWithoutPassword);
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return user without password
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Get current user
  app.get("/api/user", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Return user without password
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Get pet with decay applied
  app.get("/api/pet", requireAuth, async (req, res) => {
    try {
      let pet = await storage.getPetByUserId(req.session.userId!);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }

      // Apply stat decay
      const decayedPet = applyStatDecay(pet);
      
      // Update stats in storage with decay
      pet = await storage.updatePetStats(pet.id, {
        hunger: decayedPet.hunger,
        happiness: decayedPet.happiness,
        energy: decayedPet.energy,
        cleanliness: decayedPet.cleanliness,
      });

      // Update mood based on stats
      const newMood = calculateMood(pet.hunger, pet.happiness, pet.energy);
      if (newMood !== pet.mood) {
        pet = await storage.updatePetMood(pet.id, newMood);
      }

      res.json(pet);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pet" });
    }
  });

  // Feed pet
  app.post("/api/pet/feed", requireAuth, async (req, res) => {
    try {
      let pet = await storage.getPetByUserId(req.session.userId!);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }

      pet = await storage.updatePetStats(pet.id, {
        hunger: pet.hunger + 20,
      });

      pet = await storage.addPetXP(pet.id, 5);

      res.json(pet);
    } catch (error) {
      res.status(500).json({ error: "Failed to feed pet" });
    }
  });

  // Play with pet
  app.post("/api/pet/play", requireAuth, async (req, res) => {
    try {
      let pet = await storage.getPetByUserId(req.session.userId!);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }

      pet = await storage.updatePetStats(pet.id, {
        happiness: pet.happiness + 15,
        energy: pet.energy - 10,
      });

      pet = await storage.addPetXP(pet.id, 10);

      res.json(pet);
    } catch (error) {
      res.status(500).json({ error: "Failed to play with pet" });
    }
  });

  // Clean pet
  app.post("/api/pet/clean", requireAuth, async (req, res) => {
    try {
      let pet = await storage.getPetByUserId(req.session.userId!);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }

      pet = await storage.updatePetStats(pet.id, {
        cleanliness: pet.cleanliness + 25,
      });

      pet = await storage.addPetXP(pet.id, 8);

      res.json(pet);
    } catch (error) {
      res.status(500).json({ error: "Failed to clean pet" });
    }
  });

  // Pet sleep
  app.post("/api/pet/sleep", requireAuth, async (req, res) => {
    try {
      let pet = await storage.getPetByUserId(req.session.userId!);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }

      pet = await storage.updatePetStats(pet.id, {
        energy: pet.energy + 30,
      });

      pet = await storage.addPetXP(pet.id, 5);

      res.json(pet);
    } catch (error) {
      res.status(500).json({ error: "Failed to put pet to sleep" });
    }
  });

  // Get shop items
  app.get("/api/shop", async (req, res) => {
    try {
      const items = await storage.getAllShopItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shop items" });
    }
  });

  // Buy item
  app.post("/api/shop/buy", requireAuth, async (req, res) => {
    try {
      const { itemId } = req.body;
      if (!itemId) {
        return res.status(400).json({ error: "Item ID required" });
      }

      const user = await storage.getUser(req.session.userId!);
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

  // Use inventory item
  app.post("/api/inventory/use", requireAuth, async (req, res) => {
    try {
      const { itemId } = req.body;
      if (!itemId) {
        return res.status(400).json({ error: "Item ID required" });
      }

      const userId = req.session.userId!;

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

      // Apply item effects as deltas (additions to current stats)
      const effects = JSON.parse(item.effect) as Record<string, number>;
      const updatedStats: Record<string, number> = {};
      
      if (effects.hunger !== undefined) {
        updatedStats.hunger = Math.min(100, pet.hunger + effects.hunger);
      }
      if (effects.happiness !== undefined) {
        updatedStats.happiness = Math.min(100, pet.happiness + effects.happiness);
      }
      if (effects.energy !== undefined) {
        updatedStats.energy = Math.min(100, pet.energy + effects.energy);
      }
      if (effects.cleanliness !== undefined) {
        updatedStats.cleanliness = Math.min(100, pet.cleanliness + effects.cleanliness);
      }

      pet = await storage.updatePetStats(pet.id, updatedStats);

      res.json({ pet, inventory: await storage.getUserInventory(userId) });
    } catch (error) {
      res.status(500).json({ error: "Failed to use item" });
    }
  });

  // Get user inventory with item details
  app.get("/api/inventory", requireAuth, async (req, res) => {
    try {
      const inventory = await storage.getUserInventory(req.session.userId!);
      
      // Enrich inventory with shop item details
      const enrichedInventory = await Promise.all(
        inventory.map(async (invItem) => {
          const item = await storage.getShopItem(invItem.itemId);
          return { ...invItem, item };
        })
      );

      res.json(enrichedInventory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  // Claim daily reward
  app.post("/api/daily-reward", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const now = new Date();
      if (user.lastDailyReward) {
        const hoursSince = (now.getTime() - user.lastDailyReward.getTime()) / (1000 * 60 * 60);
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

  // Complete mini-game and award rewards
  app.post("/api/minigame/reward", requireAuth, async (req, res) => {
    try {
      const { score } = req.body;
      if (typeof score !== "number" || score < 0) {
        return res.status(400).json({ error: "Valid score required" });
      }

      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let pet = await storage.getPetByUserId(userId);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }

      // Award coins based on score (1 coin per 2 points)
      const coinsEarned = Math.floor(score / 2);
      const xpEarned = Math.floor(score / 5);
      
      // Award happiness (1 per 10 points, max 20)
      const happinessGained = Math.min(20, Math.floor(score / 10));

      await storage.updateUserCoins(user.id, user.coins + coinsEarned, user.gems);
      pet = await storage.addPetXP(pet.id, xpEarned);
      pet = await storage.updatePetStats(pet.id, {
        happiness: Math.min(100, pet.happiness + happinessGained),
      });

      res.json({ coinsEarned, happinessGained, xpEarned });
    } catch (error) {
      res.status(500).json({ error: "Failed to complete mini-game" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
