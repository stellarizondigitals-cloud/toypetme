import { getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';

export class StripeService {
  async createCustomer(email: string, userId: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.customers.create({
      email,
      metadata: { userId },
    });
  }

  async createCheckoutSession(customerId: string, priceId: string, successUrl: string, cancelUrl: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async getProduct(productId: string) {
    return await storage.getProduct(productId);
  }

  async listProducts() {
    return await storage.listProducts();
  }

  async listProductsWithPrices() {
    return await storage.listProductsWithPrices();
  }
}

export const stripeService = new StripeService();
