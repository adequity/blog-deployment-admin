import jwt from 'jsonwebtoken';
import { asyncHandler } from './errorHandler.js';
import { AuthenticationError } from './errorHandler.js';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    throw new AuthenticationError('Not authorized, no token provided');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    if (!user.is_active) {
      throw new AuthenticationError('User account is deactivated');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    throw new AuthenticationError('Not authorized, token failed');
  }
});

// Admin only middleware
export const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    throw new AuthenticationError('Not authorized as admin');
  }
});

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};
