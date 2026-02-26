/**
 * Authentication service
 * Handles user registration, login, and JWT token generation
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getSupabaseClient } from './databaseService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d';

const supabase = getSupabaseClient();

/**
 * Generate JWT token for a user
 */
export const generateToken = (userId, email) => {
  return jwt.sign(
    {
      userId,
      email,
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );
};

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error(`Invalid token: ${error.message}`);
  }
};

/**
 * Register a new user
 */
export const registerUser = async (email, password) => {
  // Validate input
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user in database
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      email,
      password_hash: passwordHash,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error registering user:', error);
    throw new Error('Failed to register user');
  }

  // Generate token
  const token = generateToken(newUser.id, newUser.email);

  return {
    user: {
      id: newUser.id,
      email: newUser.email
    },
    token
  };
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
  // Validate input
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Find user
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (fetchError || !user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken(user.id, user.email);

  return {
    user: {
      id: user.id,
      email: user.email
    },
    token
  };
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, created_at')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new Error('User not found');
  }

  return user;
};

/**
 * Refresh token (returns new token)
 */
export const refreshToken = (decodedToken) => {
  return generateToken(decodedToken.userId, decodedToken.email);
};

export default {
  generateToken,
  verifyToken,
  registerUser,
  loginUser,
  getUserById,
  refreshToken
};
