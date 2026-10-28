import Stripe from 'stripe';
import { env } from './env.js';

let stripe = null;

if (env.STRIPE.SECRET_KEY && !env.STRIPE.SECRET_KEY.includes('placeholder')) {
  stripe = new Stripe(env.STRIPE.SECRET_KEY, {
    apiVersion: '2024-12-18.acacia'
  });
}

export { stripe };
