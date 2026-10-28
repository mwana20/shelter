import { ApiError } from '../utils/ApiError.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  const response = {
    statusCode: error.statusCode,
    success: false,
    message: error.message,
    errors: error.errors
  };

  if (env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  logger.error(`${req.method} ${req.originalUrl} - [${error.statusCode}] ${error.message}`);

  return res.status(error.statusCode).json(response);
};
