/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */

import { verifyToken } from '../services/authService.js';

export const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ error: error.message });
  }
};

/**
 * Optional auth middleware - doesn't fail if no token provided
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = verifyToken(token);

      req.user = {
        userId: decoded.userId,
        email: decoded.email
      };
    }

    next();
  } catch (error) {
    // Optional auth doesn't fail on error, just continues without user
    next();
  }
};

export default authMiddleware;
