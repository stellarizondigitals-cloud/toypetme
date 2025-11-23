import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage";
import type { User } from "@shared/schema";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
// Use explicit callback URL from env, or construct from FRONTEND_URL
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 
  `${process.env.FRONTEND_URL || "http://localhost:5000"}/api/auth/google/callback`;

export function setupPassport() {
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
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
          callbackURL: GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            
            if (!email) {
              return done(new Error("No email provided by Google"), undefined);
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

            const username = profile.displayName?.replace(/\s+/g, '_').toLowerCase() || 
                            email.split('@')[0];
            
            let uniqueUsername = username;
            let counter = 1;
            while (await storage.getUserByUsername(uniqueUsername)) {
              uniqueUsername = `${username}${counter}`;
              counter++;
            }

            user = await storage.createUser(uniqueUsername, email, null, "google");
            await storage.markEmailVerified(user.id);
            
            // Don't create pet here - let tutorial handle it
            // User will see tutorial screen to select their starter pet

            return done(null, user);
          } catch (error) {
            return done(error as Error, undefined);
          }
        }
      )
    );
  }
}
