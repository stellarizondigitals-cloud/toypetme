import type { Express } from "express";
import { createServer, type Server } from "http";
import { getUncachableStripeClient } from "./stripeClient";

const BASE_URL = process.env.FRONTEND_URL || "https://toypetme.replit.app";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", game: "ToyPetMe", version: "2.0" });
  });

  // List products available in the shop (read from Stripe-synced DB)
  app.get("/api/products", async (_req, res) => {
    try {
      const stripe = await getUncachableStripeClient();
      const products = await stripe.products.list({ active: true, limit: 20 });
      const prices = await stripe.prices.list({ active: true, limit: 50 });

      const enriched = products.data
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
  app.post("/api/checkout/session", async (req, res) => {
    const { priceId, productType } = req.body;
    if (!priceId || !productType) {
      return res.status(400).json({ error: "priceId and productType are required" });
    }

    try {
      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "payment",
        success_url: `${BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=${encodeURIComponent(productType)}`,
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
  app.get("/api/checkout/verify", async (req, res) => {
    const { session_id } = req.query as { session_id?: string };
    if (!session_id) {
      return res.status(400).json({ error: "session_id is required" });
    }
    try {
      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status === "paid") {
        res.json({
          paid: true,
          productType: session.metadata?.productType ?? null,
          amountTotal: session.amount_total,
          currency: session.currency,
        });
      } else {
        res.json({ paid: false });
      }
    } catch (err: any) {
      console.error("Verify session error:", err.message);
      res.status(500).json({ error: "Failed to verify session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
