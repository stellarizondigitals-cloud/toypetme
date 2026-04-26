import { getUncachableStripeClient } from './stripeClient';

const PRODUCTS = [
  {
    name: 'ToyPetMe Premium',
    description: 'One-time unlock: remove ads, unlock exclusive cosmetics, double daily coins, and get premium badge forever.',
    metadata: { productType: 'premium' },
    price: { unit_amount: 99, currency: 'gbp' },
  },
  {
    name: 'Coin Pack — 500 Coins',
    description: 'Instantly add 500 coins to your ToyPetMe wallet to spend on food, toys, and cosmetics.',
    metadata: { productType: 'coins_500' },
    price: { unit_amount: 99, currency: 'gbp' },
  },
  {
    name: 'Coin Pack — 1,500 Coins',
    description: 'Best value: instantly add 1,500 coins to your ToyPetMe wallet.',
    metadata: { productType: 'coins_1500' },
    price: { unit_amount: 199, currency: 'gbp' },
  },
  {
    name: 'Coin Pack — 5,000 Coins',
    description: 'Ultimate bundle: instantly add 5,000 coins to your ToyPetMe wallet.',
    metadata: { productType: 'coins_5000' },
    price: { unit_amount: 499, currency: 'gbp' },
  },
];

async function createProducts() {
  try {
    const stripe = await getUncachableStripeClient();
    console.log('Creating ToyPetMe products in Stripe...\n');

    for (const def of PRODUCTS) {
      const existing = await stripe.products.search({ query: `name:'${def.name}' AND active:'true'` });
      if (existing.data.length > 0) {
        const prod = existing.data[0];
        console.log(`SKIP — already exists: ${def.name} (${prod.id})`);
        if (prod.metadata?.productType !== def.metadata.productType) {
          await stripe.products.update(prod.id, { metadata: def.metadata });
          console.log(`  UPDATED metadata productType → ${def.metadata.productType}`);
        }
        const prices = await stripe.prices.list({ product: prod.id, active: true });
        if (prices.data.length > 0) console.log(`       price: ${prices.data[0].id} (£${(prices.data[0].unit_amount! / 100).toFixed(2)})`);
        continue;
      }

      const product = await stripe.products.create({
        name: def.name,
        description: def.description,
        metadata: def.metadata,
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: def.price.unit_amount,
        currency: def.price.currency,
      });

      console.log(`CREATED: ${product.name}`);
      console.log(`  product_id: ${product.id}`);
      console.log(`  price_id:   ${price.id}  (£${(price.unit_amount! / 100).toFixed(2)})\n`);
    }

    console.log('Done! Stripe webhooks will sync data to your database automatically.');
  } catch (err: any) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createProducts();
