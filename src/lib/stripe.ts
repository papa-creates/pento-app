import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { env } from '$env/dynamic/public';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = env.PUBLIC_STRIPE_KEY;
    if (!key) {
      console.warn('Stripe public key not configured');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};
