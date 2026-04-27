import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq } from "drizzle-orm";
import { getUncachableStripeClient } from "./stripeClient";
import { db } from "./db";
import { redeemedSessions } from "@shared/schema";

const BASE_URL = process.env.FRONTEND_URL || "https://toypetme.replit.app";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", game: "ToyPetMe", version: "2.0" });
  });

  // List products available in the shop (fetched live from Stripe)
  app.get("/api/products", async (_req, res) => {
    try {
      const stripe = await getUncachableStripeClient();
      const products = await stripe.products.list({ active: true, limit: 20 });
      const prices = await stripe.prices.list({ active: true, limit: 50 });

      const VALID_TYPES = ["premium", "coins_500", "coins_1500", "coins_5000"];

      const enriched = products.data
        .filter((p) => VALID_TYPES.includes(p.metadata?.productType ?? ""))
        .map((p) => {
          const productPrices = prices.data.filter((pr) => pr.product === p.id);
          return productPrices.map((pr) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            metadata: p.metadata,
            price_id: pr.id,
            unit_amount: pr.unit_amount ?? 0,
            currency: pr.currency,
          }));
        })
        .flat()
        .sort((a, b) => a.unit_amount - b.unit_amount);

      res.json({ data: enriched });
    } catch (err: any) {
      console.error("Products fetch error:", err.message);
      res.json({ data: [] });
    }
  });

  // Create a Stripe Checkout session (guest checkout — no auth required)
  // productType is derived SERVER-SIDE from the product's Stripe metadata,
  // not trusted from client input.
  app.post("/api/checkout/session", async (req, res) => {
    const { priceId } = req.body;
    if (!priceId || typeof priceId !== "string") {
      return res.status(400).json({ error: "priceId is required" });
    }

    try {
      const stripe = await getUncachableStripeClient();

      // Look up the price and expand its product to get server-side productType
      const price = await stripe.prices.retrieve(priceId, {
        expand: ["product"],
      });

      if (!price.active) {
        return res.status(400).json({ error: "Price is not active" });
      }

      const product = price.product as { id: string; deleted?: boolean; metadata?: Record<string, string> } | string;
      if (!product || typeof product === "string") {
        return res.status(400).json({ error: "Product not found" });
      }
      if ((product as { deleted?: boolean }).deleted) {
        return res.status(400).json({ error: "Product not found" });
      }

      // productType comes from the product's own Stripe metadata — client cannot spoof this
      const productType: string = product.metadata?.productType ?? "";
      if (!productType) {
        return res.status(400).json({ error: "Product configuration error" });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "payment",
        success_url: `${BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${BASE_URL}/checkout/cancel`,
        metadata: { productType },
        billing_address_collection: "auto",
      });

      res.json({ url: session.url });
    } catch (err: any) {
      console.error("Checkout session error:", err.message);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Verify a completed checkout session (called from success page)
  // Tracks redeemed sessions to prevent replay attacks.
  app.get("/api/checkout/verify", async (req, res) => {
    const { session_id } = req.query as { session_id?: string };
    if (!session_id || typeof session_id !== "string") {
      return res.status(400).json({ error: "session_id is required" });
    }

    try {
      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (session.payment_status !== "paid") {
        return res.json({ paid: false });
      }

      const productType: string = session.metadata?.productType ?? "";

      // Check if this session has already been redeemed (replay protection)
      const existing = await db
        .select()
        .from(redeemedSessions)
        .where(eq(redeemedSessions.sessionId, session_id))
        .limit(1);

      if (existing.length > 0) {
        // Already redeemed — return success but flag it so client skips reward
        return res.json({
          paid: true,
          alreadyRedeemed: true,
          productType,
          amountTotal: session.amount_total,
          currency: session.currency,
        });
      }

      // Mark as redeemed before returning — prevents TOCTOU race conditions
      await db.insert(redeemedSessions).values({
        sessionId: session_id,
        productType,
      });

      res.json({
        paid: true,
        alreadyRedeemed: false,
        productType,
        amountTotal: session.amount_total,
        currency: session.currency,
      });
    } catch (err: any) {
      console.error("Verify session error:", err.message);
      res.status(500).json({ error: "Failed to verify session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
