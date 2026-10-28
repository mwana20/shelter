import cors from 'cors';
import { env } from './env.js';

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or curl requests with no origin
    if (!origin) return callback(null, true);

    if (env.CORS_ORIGIN.indexOf(origin) !== -1 || env.CORS_ORIGIN.includes('*')) {
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
