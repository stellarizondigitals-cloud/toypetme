import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

// JWT payload interface
export interface JWTPayload {
  id: string;
  email: string;
  verified: boolean;
}

// Environment variables for JWT
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION: string = process.env.JWT_EXPIRATION || "15m";
const JWT_REFRESH_EXPIRATION: string = process.env.JWT_REFRESH_EXPIRATION || "7d";

// Validate JWT_SECRET at startup
if (!JWT_SECRET) {
  console.error("❌ CRITICAL: JWT_SECRET environment variable is not set!");
  console.error("   JWT authentication will not work. Please set JWT_SECRET in your environment.");
  process.exit(1);
}

/**
 * Middleware to verify JWT token from Authorization header
 * Use this for API routes that mobile apps will access
 */
export function verifyJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "Invalid Authorization header format" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as JWTPayload;
    
    // Attach user info to request for downstream handlers
    (req as any).user = decoded;
    
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({ error: "Token expired" });
    }
    return res.status(403).json({ error: "Invalid or malformed token" });
  }
}

/**
 * Generate a JWT token for an authenticated user
 */
export function generateJWT(user: { id: string; email: string; verified: boolean }): string {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    verified: user.verified,
  };

  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRATION,
  });
}

/**
 * Generate a refresh token with longer expiration
 */
export function generateRefreshToken(user: { id: string; email: string }): string {
  const payload = {
    id: user.id,
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: JWT_REFRESH_EXPIRATION,
  });
}

/**
 * Verify a refresh token and return the payload
 */
export function verifyRefreshToken(token: string): { id: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!, { ignoreExpiration: false }) as any;
    return { id: decoded.id, email: decoded.email };
  } catch {
    return null;
  }
}
