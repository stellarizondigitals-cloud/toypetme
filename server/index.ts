import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import memorystore from "memorystore";
import pgSession from "connect-pg-simple";
import passport from "passport";
import { setupPassport } from "./passport";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import postgres from "postgres";
import { runMigrations } from 'stripe-replit-sync';
import { getStripeSync } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";

const app = express();

// Validate critical environment variables
if (!process.env.SESSION_SECRET) {
  console.error("❌ CRITICAL: SESSION_SECRET environment variable is not set!");
  console.error("   This is a security risk. Please set SESSION_SECRET in your environment.");
  process.exit(1);
}

// Initialize Stripe schema and sync data on startup
async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn("⚠️ DATABASE_URL not set - Stripe integration skipped");
    return;
  }

  try {
    console.log('Initializing Stripe schema...');
    await runMigrations({ databaseUrl });
    console.log('✅ Stripe schema ready');

    const stripeSync = await getStripeSync();
    console.log('Setting up managed webhook...');
    
    const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}`;
    const { webhook, uuid } = await stripeSync.findOrCreateManagedWebhook(
      `${webhookBaseUrl}/api/stripe/webhook`,
      { enabled_events: ['*'], description: 'ToyPetMe Stripe sync webhook' }
    );
    console.log(`✅ Webhook configured: ${webhook.url}`);

    stripeSync.syncBackfill()
      .then(() => console.log('✅ Stripe data synced'))
      .catch((err) => console.error('⚠️ Stripe backfill error:', err.message));
  } catch (error) {
    console.warn("⚠️ Stripe initialization warning:", error instanceof Error ? error.message : String(error));
  }
}

initStripe();

// Trust proxy for rate limiting behind Replit's reverse proxy
app.set('trust proxy', true);

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // Check if request is already HTTPS
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      return next();
    }
    
    // Redirect HTTP to HTTPS
    const httpsUrl = `https://${req.headers.host}${req.url}`;
    res.redirect(301, httpsUrl);
  });
}

// Determine session store based on environment
const getSessionStore = () => {
  // In production with DATABASE_URL, use PostgreSQL for persistent sessions
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    try {
      const PgSession = pgSession(session);
      const sql = postgres(process.env.DATABASE_URL);
      console.log("✅ Session store: PostgreSQL (persistent across restarts)");
      return new PgSession({
        pool: sql as any,
        createTableIfMissing: true,
      });
    } catch (error) {
      console.warn("⚠️ PostgreSQL session store failed, falling back to memory");
      console.warn("Error:", error instanceof Error ? error.message : String(error));
    }
  }
  
  // Fallback to in-memory store (development, or if DB is unavailable)
  console.log("ℹ️ Session store: Memory (sessions lost on server restart)");
  const MemoryStore = memorystore(session);
  return new MemoryStore({
    checkPeriod: 86400000,
  });
};

const sessionStore = getSessionStore();

app.use(
  session({
    cookie: { 
      maxAge: 86400000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    },
    store: sessionStore,
    resave: false,
    secret: process.env.SESSION_SECRET || "toypetme-secret-key-change-in-production",
    saveUninitialized: false,
  })
);

// Initialize Passport
setupPassport();
app.use(passport.initialize());
app.use(passport.session());

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// ⚠️ CRITICAL: Stripe webhook route MUST be registered BEFORE express.json()
app.post(
  '/api/stripe/webhook/:uuid',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature' });
    }

    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;
      const { uuid } = req.params;
      
      if (!Buffer.isBuffer(req.body)) {
        console.error('⚠️ Webhook body is not a Buffer - express.json() may have run first');
        return res.status(500).json({ error: 'Webhook processing error' });
      }

      await WebhookHandlers.processWebhook(req.body as Buffer, sig, uuid);
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: 'Webhook processing error' });
    }
  }
);

// NOW apply express.json() - AFTER webhook route
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const PORT = parseInt(process.env.PORT || '5000', 10);

  // Only listen when not running on Vercel (Vercel handles the server)
  if (!process.env.VERCEL) {
    server.listen({
      port: PORT,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${PORT}`);
    });
  }
})();

// Export app for Vercel serverless function
export default app;
