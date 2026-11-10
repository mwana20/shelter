import cors from 'cors';
import { env } from './env.js';

// Normalize and remove duplicate origins
const allowedOrigins = [
  ...new Set(
    env.CORS_ORIGIN
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
  ]
};

export const corsMiddleware = cors(corsOptions);