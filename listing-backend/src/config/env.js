import dotenv from 'dotenv';
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',

  DATABASE_URL: process.env.DATABASE_URL || '',

  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_key_32_characters_minimum',
    ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION || '15m',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_key_32_characters_minimum',
    REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '7d',
    RESET_SECRET: process.env.JWT_RESET_SECRET || 'dev_jwt_reset_secret_key_32_characters_minimum',
    RESET_EXPIRATION: process.env.JWT_RESET_EXPIRATION || '15m',
    VERIFY_SECRET: process.env.JWT_VERIFY_SECRET || 'dev_jwt_verify_secret_key_32_characters_minimum',
    VERIFY_EXPIRATION: process.env.JWT_VERIFY_EXPIRATION || '24h'
  },

  CORS_ORIGIN: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://localhost:5173'],

  STRIPE: {
    SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
    SUCCESS_URL: process.env.STRIPE_SUCCESS_URL || 'http://localhost:3000/#/property-detail?id={PROPERTY_ID}&unlock_status=success',
    CANCEL_URL: process.env.STRIPE_CANCEL_URL || 'http://localhost:3000/#/property-detail?id={PROPERTY_ID}&unlock_status=cancelled'
  },

  R2: {
    ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '',
    ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || '',
    SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || '',
    BUCKET_NAME: process.env.R2_BUCKET_NAME || 'sheltered-property-media',
    PUBLIC_DOMAIN: process.env.R2_PUBLIC_DOMAIN || 'https://media.shelteredglobal.com'
  },

  SMTP: {
    HOST: process.env.SMTP_HOST || 'smtp.mailgun.org',
    PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    SECURE: process.env.SMTP_SECURE === 'true',
    USER: process.env.SMTP_USER || '',
    PASS: process.env.SMTP_PASS || '',
    FROM: process.env.EMAIL_FROM || 'Sheltered Real Estate <noreply@shelteredglobal.com>'
  },

  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    MAX: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    AUTH_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '10', 10)
  }
};
