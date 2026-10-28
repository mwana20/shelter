import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT.ACCESS_SECRET, {
    expiresIn: env.JWT.ACCESS_EXPIRATION
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT.REFRESH_SECRET, {
    expiresIn: env.JWT.REFRESH_EXPIRATION
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT.ACCESS_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT.REFRESH_SECRET);
};

export const generateRandomToken = (prefix = 'tok_') => {
  return `${prefix}${crypto.randomBytes(32).toString('hex')}`;
};

export const generateNumericCode = (digits = 6) => {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};
