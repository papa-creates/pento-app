import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url }) => {
  const { STRIPE_SECRET_KEY, STRIPE_PRICE_ID } = env;

  if (!STRIPE_SECRET_KEY || !STRIPE_PRICE_ID) {
    console.error('Missing Stripe configuration');
    return json({ error: 'Payment system not configured' }, { status: 500 });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${url.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${url.origin}/pricing`,
      metadata: {
        app: 'pento'
      }
    });

    return json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
};
