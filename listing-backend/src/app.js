import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsMiddleware } from './config/cors.js';
import { globalRateLimiter } from './middlewares/rateLimiter.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { env } from './config/env.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import propertyRoutes from './modules/properties/property.routes.js';
import mediaRoutes from './modules/media/media.routes.js';
import paymentRoutes from './modules/payments/payment.routes.js';
import unlockRoutes from './modules/unlocks/unlock.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(corsMiddleware);

// HTTP request logger
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Rate limiting
app.use(globalRateLimiter);

// Parse JSON and URL-encoded bodies (except raw stripe webhook route handled in payment.routes.js)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'sheltered-listing-backend',
    version: '1.0.0'
  });
});

// Mount API Modules
const prefix = env.API_PREFIX;
app.use(`${prefix}/auth`, authRoutes);
app.use(`${prefix}/users`, userRoutes);
app.use(`${prefix}/properties`, propertyRoutes);
app.use(`${prefix}/media`, mediaRoutes);
app.use(`${prefix}/payments`, paymentRoutes);
app.use(`${prefix}/unlocks`, unlockRoutes);
app.use(`${prefix}/admin`, adminRoutes);

// Catch 404 routes
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

export { app };
