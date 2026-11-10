import cors from 'cors';
import { env } from './env.js';

// Keep the app's known origins available even when CORS_ORIGIN is set in production.
const allowedOrigins = [
  ...new Set(
    [
      'https://shelter-coral.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      ...env.CORS_ORIGIN
    ]
      .map(origin => origin.trim().replace(/\/+$/, ''))
      .filter(Boolean)
  )
];

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header (server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.trim().replace(/\/+$/, '');

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.error(`CORS rejected origin: ${origin}`);

    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'stripe-signature'
  ],

  preflightContinue: false,
  optionsSuccessStatus: 204
};

export const corsMiddleware = cors(corsOptions);