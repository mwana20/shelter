import dotenv from 'dotenv';
dotenv.config();

const positiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

const jwtDefaults = {
  ACCESS_SECRET: '3ad2efca697f198952615516cd5113f118c6ba8f0f659b1902e0b7bb46302a4fe2801f463e8f0225a4831a9714568c02',
  REFRESH_SECRET: 'c9b1e0da440cebe3152e625a5e9267f4aa1de3190539daea3b919be202cebefd8c81968f2dfec5cb92dc3f1a88980473',
  RESET_SECRET: '8be4d770bcaa4e932d11ec0c7f9190088d6e2315a2a595c28da4bb8cf37ee5a12cdb9eb99ab96514bc6b853d4dbe14ef',
  VERIFY_SECRET: '3e9c69fa0934bec23744c25e912915aa653d32ca9fca7ac05b157b5d45bd8ca3f0f3f3d4a918fe13624dc199a2ba5d6d'
};

const resolveJwtSecret = (envNames, fallback) => {
  const names = Array.isArray(envNames) ? envNames : [envNames];
  const matchedName = names.find((name) => process.env[name]);
  const value = matchedName ? process.env[matchedName] : fallback;
  if (isProduction) {
    if (!matchedName || value === fallback || value.length < 32) {
      throw new Error(`Insecure or missing ${names.join(' or ')}. Set a unique secret of at least 32 characters for production.`);
    }
  }
  if (!isProduction && matchedName && value.length < 32) {
    console.warn(`Warning: ${matchedName} is shorter than 32 characters; use a longer secret in production.`);
  }
  return value;
};

export const env = {
  NODE_ENV,
  PORT: parseInt(process.env.PORT || '5000', 10),
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  AUTH_COOKIE_SAME_SITE: process.env.AUTH_COOKIE_SAME_SITE ||
    (isProduction ? 'none' : 'lax'),

  DATABASE_URL: process.env.DATABASE_URL || '',
  DIRECT_URL: process.env.DIRECT_URL || '',

  JWT: {
    ACCESS_SECRET: resolveJwtSecret('JWT_ACCESS_SECRET', jwtDefaults.ACCESS_SECRET),
    ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION || '15m',
    REFRESH_SECRET: resolveJwtSecret('JWT_REFRESH_SECRET', jwtDefaults.REFRESH_SECRET),
    REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '7d',
    RESET_SECRET: resolveJwtSecret(['JWT_RESET_SECRET', 'JWT_PASSWORD_RESET_SECRET'], jwtDefaults.RESET_SECRET),
    RESET_EXPIRATION: process.env.JWT_RESET_EXPIRATION || '15m',
    VERIFY_SECRET: resolveJwtSecret(['JWT_VERIFY_SECRET', 'JWT_EMAIL_SECRET'], jwtDefaults.VERIFY_SECRET),
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
    ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '33f7046fc19ea2b952c2c8079899eeee',
    ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || '7d2908c666cdfbd35c04c610586eeec8',
    SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || 'a4f3a3fc0e030df158be84ffb58f615bfc9f770774b0cfd1993bc82db07e29e3',
    BUCKET_NAME: process.env.R2_BUCKET_NAME || 'sheltered-property-media',
    PUBLIC_URL: process.env.R2_PUBLIC_URL || process.env.R2_PUBLIC_DOMAIN || '',
    MAX_IMAGE_SIZE_BYTES: positiveInt(process.env.R2_MAX_IMAGE_SIZE_BYTES, 12 * 1024 * 1024),
    MAX_VIDEO_SIZE_BYTES: positiveInt(process.env.R2_MAX_VIDEO_SIZE_BYTES, 100 * 1024 * 1024),
    MAX_THUMBNAIL_SIZE_BYTES: positiveInt(process.env.R2_MAX_THUMBNAIL_SIZE_BYTES, 1024 * 1024),
    UPLOAD_URL_TTL_SECONDS: positiveInt(process.env.R2_UPLOAD_URL_TTL_SECONDS, 900),
    UPLOAD_BATCH_TTL_MINUTES: positiveInt(process.env.R2_UPLOAD_BATCH_TTL_MINUTES, 1440)
  },

  MAILJET: {
    API_KEY_PUBLIC: process.env.MJ_APIKEY_PUBLIC || '',
    API_KEY_PRIVATE: process.env.MJ_APIKEY_PRIVATE || '',
    FROM_EMAIL: process.env.EMAIL_FROM || '',
    FROM_NAME: process.env.EMAIL_FROM_NAME || 'Shelter'
  },

  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    MAX: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    AUTH_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '10', 10)
  }
};
