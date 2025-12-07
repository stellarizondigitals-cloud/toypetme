import { getUncachableStripeClient } from './server/stripeClient';

async function seedProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('Creating Stripe products for ToyPetMe...');

  // Check if products already exist
  const existingProducts = await stripe.products.list({ limit: 100 });
  if (existingProducts.data.length > 0) {
    console.log(`Found ${existingProducts.data.length} existing products. Skipping creation.`);
    return;
  }

  // Coin Packs
  const coinPack1 = await stripe.products.create({
    name: '500 Coins',
    description: 'Get 500 coins for in-game purchases',
    metadata: {
      type: 'coins',
      amount: '500',
    },
  });

  const coinPrice1 = await stripe.prices.create({
    product: coinPack1.id,
    unit_amount: 99, // $0.99
    currency: 'usd',
    metadata: {
      coins: '500',
    },
  });

  const coinPack2 = await stripe.products.create({
    name: '1500 Coins',
    description: 'Get 1500 coins - Best value!',
    metadata: {
      type: 'coins',
      amount: '1500',
    },
  });

  const coinPrice2 = await stripe.prices.create({
    product: coinPack2.id,
    unit_amount: 199, // $1.99
    currency: 'usd',
    metadata: {
      coins: '1500',
    },
  });

  // Premium Subscription
  const premiumProduct = await stripe.products.create({
    name: 'Premium Subscription',
    description: 'Get exclusive perks and no ads',
    metadata: {
      type: 'premium',
    },
  });

  const premiumPrice = await stripe.prices.create({
    product: premiumProduct.id,
    unit_amount: 499, // $4.99
    currency: 'usd',
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    metadata: {
      premium: 'true',
    },
  });

  console.log('✅ Products created:');
  console.log(`  - 500 Coins: ${coinPrice1.id}`);
  console.log(`  - 1500 Coins: ${coinPrice2.id}`);
  console.log(`  - Premium Subscription: ${premiumPrice.id}`);
  console.log('\nRun this script again anytime to check existing products.');
}

seedProducts().catch(console.error);
