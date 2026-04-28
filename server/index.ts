import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { WebhookHandlers } from "./webhookHandlers";
import { runMigrations } from "stripe-replit-sync";
import { getStripeSync } from "./stripeClient";
import { db } from "./db";
import { sql } from "drizzle-orm";

const app = express();

// Redirect www → non-www for canonical SEO
app.use((req: Request, res: Response, next: NextFunction) => {
  const host = req.headers.host || "";
  if (host.startsWith("www.")) {
    const nonWww = host.slice(4);
    return res.redirect(301, `https://${nonWww}${req.url}`);
  }
  next();
});

// CRITICAL: Stripe webhook MUST be registered before express.json() middleware
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      return res.status(400).json({ error: "Missing stripe-signature" });
    }
    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;
      await WebhookHandlers.processWebhook(req.body as Buffer, sig);
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error.message);
      res.status(400).json({ error: "Webhook processing error" });
    }
  }
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

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

async function ensureAppTables() {
  if (!process.env.DATABASE_URL) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS redeemed_sessions (
        session_id TEXT PRIMARY KEY,
        product_type TEXT NOT NULL,
        redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  } catch (err: any) {
    log(`App table init error: ${err.message}`);
  }
}

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    log("DATABASE_URL not set — skipping Stripe init");
    return;
  }
  try {
    log("Initialising Stripe schema...");
    await runMigrations({ databaseUrl });
    log("Stripe schema ready");

    const stripeSync = await getStripeSync();
    const webhookBase = `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}`;
    await stripeSync.findOrCreateManagedWebhook(`${webhookBase}/api/stripe/webhook`);
    log("Stripe webhook configured");

    stripeSync.syncBackfill()
      .then(() => log("Stripe backfill complete"))
      .catch((err: any) => log(`Stripe backfill error: ${err.message}`));
  } catch (err: any) {
    log(`Stripe init error: ${err.message}`);
  }
}

(async () => {
  await ensureAppTables();
  await initStripe();

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = parseInt(process.env.PORT || "5000", 10);
  server.listen({ port: PORT, host: "0.0.0.0", reusePort: true }, () => {
    log(`serving on port ${PORT}`);
  });
})();
