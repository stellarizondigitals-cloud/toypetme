import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPetSchema, createPetRequestSchema, signupSchema, loginSchema, requestResetSchema, resetPasswordSchema, type User, PET_ACTIONS, type PetActionType } from "@shared/schema";
import bcrypt from "bcryptjs";
import { generateToken, sendVerificationEmail, sendPasswordResetEmail } from "./email";
import rateLimit from "express-rate-limit";
import passport from "passport";
import { generateJWT, generateRefreshToken, verifyRefreshToken } from "./jwt";

// Helper to evaluate cooldown status
function evaluateCooldown(lastActionTime: Date | null, cooldownMinutes: number): { ready: boolean; remainingSeconds: number } {
  if (!lastActionTime) {
    return { ready: true, remainingSeconds: 0 };
  }
  
  const now = Date.now();
  const lastAction = new Date(lastActionTime).getTime();
  const cooldownMs = cooldownMinutes * 60 * 1000;
  const elapsedMs = now - lastAction;
  
  if (elapsedMs >= cooldownMs) {
    return { ready: true, remainingSeconds: 0 };
  }
  
  const remainingMs = cooldownMs - elapsedMs;
  return { ready: false, remainingSeconds: Math.ceil(remainingMs / 1000) };
}

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Rate limiting for authentication routes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: { error: "Too many attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
  });

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

      // Create user (local auth type, unverified)
      const user = await storage.createUser(username, email, passwordHash, "local");

      // Generate verification token (24 hour expiry)
      const verificationToken = generateToken();
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await storage.setVerificationToken(user.id, verificationToken, tokenExpiry);

      // Send verification email (async, don't wait)
      sendVerificationEmail(email, username, verificationToken).catch(err => {
        console.error("Failed to send verification email:", err);
      });

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
    const maskedEmail = req.body.email ? req.body.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'unknown';
    
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        console.log(`🔒 Login failed - validation error for ${maskedEmail}`);
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const { email, password } = validation.data;

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log(`🔒 Login failed - user not found: ${maskedEmail}`);
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Check if user has a password (local auth only)
      if (!user.passwordHash) {
        console.log(`🔒 Login failed - OAuth user tried password login: ${maskedEmail}`);
        return res.status(401).json({ error: "Please use Google sign-in for this account" });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        console.log(`🔒 Login failed - invalid password for: ${maskedEmail}`);
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Regenerate session to prevent session fixation attacks
      req.session.regenerate((err) => {
        if (err) {
          console.error(`❌ Session regeneration error for ${maskedEmail}:`, err);
          return res.status(500).json({ error: "Failed to create session" });
        }

        // Set session
        req.session.userId = user.id;

        // Save session before sending response
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error(`❌ Session save error for ${maskedEmail}:`, saveErr);
            return res.status(500).json({ error: "Failed to save session" });
          }

          console.log(`✅ Login successful for ${maskedEmail} (userId: ${user.id})`);
          
          // Return user without password
          const { passwordHash: _, ...userWithoutPassword } = user;
          res.json(userWithoutPassword);
        });
      });
    } catch (error) {
      console.error(`❌ Login error for ${maskedEmail}:`, error);
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

  // Email verification
  app.get("/api/auth/verify", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: "Invalid verification token" });
      }

      // Find user by verification token
      const user = await storage.getUserByVerificationToken(token);
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired verification token" });
      }

      // Check if token is expired
      if (user.verificationTokenExpiry && new Date() > user.verificationTokenExpiry) {
        return res.status(400).json({ error: "Verification token has expired" });
      }

      // Verify user
      await storage.verifyUser(user.id);

      res.json({ message: "Email verified successfully! You can now log in." });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ error: "Failed to verify email" });
    }
  });

  // Resend verification email
  app.post("/api/auth/resend-verification", authLimiter, async (req, res) => {
    try {
      const validation = requestResetSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const { email } = validation.data;

      // Find user
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.json({ message: "If that email exists and is unverified, a verification link has been sent" });
      }

      // Check if already verified
      if (user.verified) {
        return res.json({ message: "Email is already verified" });
      }

      // Generate new verification token (24 hour expiry)
      const verificationToken = generateToken();
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await storage.setVerificationToken(user.id, verificationToken, tokenExpiry);

      // Send verification email (async, don't wait)
      sendVerificationEmail(email, user.username, verificationToken).catch(err => {
        console.error("Failed to send verification email:", err);
      });

      res.json({ message: "Verification email sent! Check your inbox." });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ error: "Failed to resend verification email" });
    }
  });

  // Request password reset
  app.post("/api/auth/request-reset", authLimiter, async (req, res) => {
    try {
      const validation = requestResetSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const { email } = validation.data;

      // Find user
      const user = await storage.getUserByEmail(email);
      
      // Always return success even if user doesn't exist (security best practice)
      if (!user) {
        return res.json({ message: "If that email exists, a password reset link has been sent" });
      }

      // Check if user uses Google OAuth
      if (user.authType === 'google') {
        return res.json({ message: "If that email exists, a password reset link has been sent" });
      }

      // Generate reset token (15 minute expiry)
      const resetToken = generateToken();
      const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      await storage.setResetToken(user.id, resetToken, tokenExpiry);

      // Send reset email (async, don't wait)
      sendPasswordResetEmail(email, user.username, resetToken).catch(err => {
        console.error("Failed to send password reset email:", err);
      });

      res.json({ message: "If that email exists, a password reset link has been sent" });
    } catch (error) {
      console.error("Password reset request error:", error);
      res.status(500).json({ error: "Failed to process password reset request" });
    }
  });

  // Reset password with token
  app.post("/api/auth/reset-password", authLimiter, async (req, res) => {
    try {
      const validation = resetPasswordSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const { token, password } = validation.data;

      // Find user by reset token
      const user = await storage.getUserByResetToken(token);
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      // Check if token is expired
      if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
        return res.status(400).json({ error: "Reset token has expired" });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(password, 10);

      // Update password and clear reset token
      await storage.resetPassword(user.id, passwordHash);

      res.json({ message: "Password reset successfully! You can now log in with your new password." });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // Google OAuth - Initiate
  app.get("/api/auth/google", (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(503).json({ error: "Google OAuth is not configured" });
    }
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  });

  // Google OAuth - Callback
  app.get("/api/auth/google/callback", (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.redirect("/login?error=oauth_not_configured");
    }
    passport.authenticate("google", { failureRedirect: "/login" })(req, res, next);
  }, (req, res) => {
      // Regenerate session for security
      const user = req.user as User;
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

  // ===== JWT TOKEN ROUTES (For Mobile/API Access) =====
  
  /**
   * GET /api/token
   * Issue a JWT token for authenticated session users
   * This allows mobile apps to get a token after web login
   */
  app.get("/api/token", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate JWT with user info
      const token = generateJWT({
        id: user.id,
        email: user.email,
        verified: user.verified
      });

      // Also generate refresh token for long-term access
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

  /**
   * POST /api/token/refresh
   * Refresh an expired JWT using a valid refresh token
   */
  app.post("/api/token/refresh", async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token required" });
      }

      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);
      if (!payload) {
        return res.status(401).json({ error: "Invalid or expired refresh token" });
      }

      // Get fresh user data
      const user = await storage.getUser(payload.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate new JWT
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

  // Toggle premium status (for testing)
  app.post("/api/user/toggle-premium", requireAuth, async (req, res) => {
    try {
      const user = await storage.togglePremium(req.session.userId!);
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle premium status" });
    }
  });

  // Watch ad for bonus (free users only)
  app.post("/api/ads/watch-bonus", requireAuth, async (req, res) => {
    try {
      const result = await storage.watchAdBonus(req.session.userId!);
      const { passwordHash: _, ...userWithoutPassword } = result.user;
      res.json({
        user: userWithoutPassword,
        coinsEarned: result.coinsEarned,
        adsRemaining: result.adsRemaining,
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

  // Store purchase (demo mode - no real payment processing)
  app.post("/api/store/purchase", requireAuth, async (req, res) => {
    try {
      const { itemId, price } = req.body;
      
      if (!itemId || !price) {
        return res.status(400).json({ error: "Missing itemId or price" });
      }

      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Demo mode: Simulate purchase without real payment
      // In production, this would integrate with Stripe/PayPal
      
      // Handle different item types
      let coinsToAdd = 0;
      
      if (itemId === "coin-pack-100") {
        coinsToAdd = 100;
      } else if (itemId === "coin-pack-500") {
        coinsToAdd = 500;
      } else if (itemId.includes("egg") || itemId.includes("booster")) {
        // For eggs and boosters, add them to inventory (future feature)
        // For now, just log the purchase
        console.log(`Demo purchase: ${itemId} for user ${userId}`);
      }

      // Add coins if it's a coin pack
      if (coinsToAdd > 0) {
        const MAX_COINS = 5000;
        const newCoins = Math.min(user.coins + coinsToAdd, MAX_COINS);
        const actualCoinsAdded = newCoins - user.coins;
        
        const updatedUser = await storage.updateUserCoins(userId, newCoins, user.gems);
        const { passwordHash: _, ...userWithoutPassword } = updatedUser;
        
        return res.json({
          success: true,
          user: userWithoutPassword,
          itemId,
          coinsAdded: actualCoinsAdded,
          message: `Demo purchase successful! Added ${actualCoinsAdded} coins.`,
        });
      }

      // For non-coin items, just return success
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json({
        success: true,
        user: userWithoutPassword,
        itemId,
        message: `Demo purchase successful! ${itemId} added to your account.`,
      });
    } catch (error) {
      console.error("Store purchase error:", error);
      res.status(500).json({ error: "Failed to process purchase" });
    }
  });

  // Get pet with decay applied
  app.get("/api/pet", requireAuth, async (req, res) => {
    try {
      let pet = await storage.getPetByUserId(req.session.userId!);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }

      // Apply stat decay (atomically updates stats, health, isSick, lastDecayCheck)
      pet = await storage.applyStatDecay(pet.id);

      // Update mood based on current stats
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
      const userId = req.session.userId!;
      let pet = await storage.getPetByUserId(userId);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }

      // Apply decay before action to ensure fresh stats
      pet = await storage.applyStatDecay(pet.id);

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check cooldown
      const action = PET_ACTIONS.feed;
      const cooldownCheck = evaluateCooldown(pet.lastFed, action.cooldownMinutes);
      if (!cooldownCheck.ready) {
        return res.status(409).json({
          error: `You need to wait before feeding again`,
          code: "COOLDOWN_ACTIVE",
          remainingSeconds: cooldownCheck.remainingSeconds,
        });
      }

      // Perform action (earns coins)
      const result = await storage.performPetAction(userId, pet.id, "feed");
      res.json(result);
    } catch (error) {
      console.error("Feed error:", error);
      res.status(500).json({ error: "Failed to feed pet" });
    }
  });

  // Play with pet
  app.post("/api/pet/play", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      let pet = await storage.getPetByUserId(userId);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }

      // Apply decay before action to ensure fresh stats
      pet = await storage.applyStatDecay(pet.id);

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check cooldown
      const action = PET_ACTIONS.play;
      const cooldownCheck = evaluateCooldown(pet.lastPlayed, action.cooldownMinutes);
      if (!cooldownCheck.ready) {
        return res.status(409).json({
          error: `You need to wait before playing again`,
          code: "COOLDOWN_ACTIVE",
          remainingSeconds: cooldownCheck.remainingSeconds,
        });
      }

      // Perform action (earns coins)
      const result = await storage.performPetAction(userId, pet.id, "play");
      res.json(result);
    } catch (error) {
      console.error("Play error:", error);
      res.status(500).json({ error: "Failed to play with pet" });
    }
  });

  // Clean pet
  app.post("/api/pet/clean", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      let pet = await storage.getPetByUserId(userId);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }

      // Apply decay before action to ensure fresh stats
      pet = await storage.applyStatDecay(pet.id);

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check cooldown
      const action = PET_ACTIONS.clean;
      const cooldownCheck = evaluateCooldown(pet.lastCleaned, action.cooldownMinutes);
      if (!cooldownCheck.ready) {
        return res.status(409).json({
          error: `You need to wait before cleaning again`,
          code: "COOLDOWN_ACTIVE",
          remainingSeconds: cooldownCheck.remainingSeconds,
        });
      }

      // Perform action (earns coins)
      const result = await storage.performPetAction(userId, pet.id, "clean");
      res.json(result);
    } catch (error) {
      console.error("Clean error:", error);
      res.status(500).json({ error: "Failed to clean pet" });
    }
  });

  // Pet sleep
  app.post("/api/pet/sleep", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      let pet = await storage.getPetByUserId(userId);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }

      // Apply decay before action to ensure fresh stats
      pet = await storage.applyStatDecay(pet.id);

      // Perform action (earns coins)
      const result = await storage.performPetAction(userId, pet.id, "sleep");
      res.json(result);
    } catch (error) {
      console.error("Sleep error:", error);
      res.status(500).json({ error: "Failed to put pet to sleep" });
    }
  });

  // Get all user's pets
  app.get("/api/pets", requireAuth, async (req, res) => {
    try {
      const pets = await storage.getAllPetsByUserId(req.session.userId!);
      res.json(pets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pets" });
    }
  });

  // Create new pet with random stats
  app.post("/api/pets", requireAuth, async (req, res) => {
    try {
      const validation = createPetRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const { name, type } = validation.data;
      const userId = req.session.userId!;

      // Check pet count limit (max 20 pets per user)
      const existingPets = await storage.getAllPetsByUserId(userId);
      if (existingPets.length >= 20) {
        return res.status(400).json({ error: "Maximum of 20 pets reached" });
      }

      // Generate random initial stats (60-100 range for good start)
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
        mood: "happy",
      });

      res.json(newPet);
    } catch (error) {
      console.error("Pet creation error:", error);
      res.status(500).json({ error: "Failed to create pet" });
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
      const xpResult = await storage.addPetXP(pet.id, xpEarned);
      pet = xpResult.pet;
      pet = await storage.updatePetStats(pet.id, {
        happiness: Math.min(100, pet.happiness + happinessGained),
      });

      res.json({ coinsEarned, happinessGained, xpEarned });
    } catch (error) {
      res.status(500).json({ error: "Failed to complete mini-game" });
    }
  });

  // ===== SHOP & INVENTORY ROUTES =====

  // Get all shop items
  app.get("/api/shop", requireAuth, async (req, res) => {
    try {
      const items = await storage.getAllShopItems();
      res.json(items);
    } catch (error) {
      console.error("Shop fetch error:", error);
      res.status(500).json({ error: "Failed to fetch shop items" });
    }
  });

  // Purchase shop item
  app.post("/api/shop/purchase", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { itemId } = req.body;

      if (!itemId) {
        return res.status(400).json({ error: "Item ID is required" });
      }

      const result = await storage.purchaseItem(userId, itemId);
      res.json(result);
    } catch (error: any) {
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

  // Get user inventory
  app.get("/api/inventory", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const userInventory = await storage.getUserInventory(userId);
      res.json(userInventory);
    } catch (error) {
      console.error("Inventory fetch error:", error);
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  // Use inventory item
  app.post("/api/inventory/use", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { itemId } = req.body;

      if (!itemId) {
        return res.status(400).json({ error: "Item ID is required" });
      }

      let pet = await storage.getPetByUserId(userId);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }

      // Get the item details
      const item = await storage.getShopItem(itemId);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }

      // Use the item (decrements quantity)
      const inventoryItem = await storage.useInventoryItem(userId, itemId);
      if (!inventoryItem) {
        return res.status(404).json({ error: "Item not in inventory or already used" });
      }

      // Apply item effects to pet
      const effects = JSON.parse(item.effect);
      const updates: any = {};
      
      for (const [stat, value] of Object.entries(effects)) {
        const currentValue = pet[stat as keyof typeof pet] as number;
        updates[stat] = Math.min(100, Math.max(0, currentValue + (value as number)));
      }

      pet = await storage.updatePetStats(pet.id, updates);

      res.json({ pet, itemUsed: item, remainingQuantity: inventoryItem.quantity });
    } catch (error) {
      console.error("Use item error:", error);
      res.status(500).json({ error: "Failed to use item" });
    }
  });

  // ===== LEADERBOARD ROUTES =====
  
  // Get leaderboard by highest level pet
  app.get("/api/leaderboard/highest-level", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const result = await storage.getLeaderboardByHighestLevelPet(userId);
      res.json(result);
    } catch (error) {
      console.error("Leaderboard (highest level) error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Get leaderboard by most pets owned
  app.get("/api/leaderboard/most-pets", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const result = await storage.getLeaderboardByMostPets(userId);
      res.json(result);
    } catch (error) {
      console.error("Leaderboard (most pets) error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Get leaderboard by total coins
  app.get("/api/leaderboard/total-coins", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const result = await storage.getLeaderboardByTotalCoins(userId);
      res.json(result);
    } catch (error) {
      console.error("Leaderboard (total coins) error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // ===== DAILY CHALLENGES ROUTES =====
  
  // Get daily challenges for user
  app.get("/api/challenges/daily", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const challenges = await storage.getDailyChallenges(userId);
      res.json(challenges);
    } catch (error) {
      console.error("Get daily challenges error:", error);
      res.status(500).json({ error: "Failed to fetch daily challenges" });
    }
  });

  // Claim challenge reward
  app.post("/api/challenges/:id/claim", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { id } = req.params;

      const result = await storage.claimChallengeReward(userId, id);
      res.json(result);
    } catch (error: any) {
      console.error("Claim challenge reward error:", error);
      
      if (error.message === 'Challenge not found') {
        return res.status(404).json({ error: error.message });
      } else if (error.message === 'Challenge not completed') {
        return res.status(400).json({ error: error.message });
      } else if (error.message === 'Reward already claimed') {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ error: "Failed to claim challenge reward" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
