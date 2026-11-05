import cors from 'cors';
import { env } from './env.js';

const allowedOrigins = [
  ...env.CORS_ORIGIN,
  'https://sheltermkn.netlify.app'
];

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or curl requests with no origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'stripe-signature']
};

export const corsMiddleware = cors(corsOptions);
