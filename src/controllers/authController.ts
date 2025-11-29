import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import {
  validateRegistration,
  validateLogin,
  validateUserIdOnly,
} from '../utils/validation';
import * as dotenv from 'dotenv';

dotenv.config(); // Loads variables from .env into process.env

// Interface for request bodies
interface RegisterRequest {
  username: string;
  password: string;
  userId: string;
}

// Helper function to generate JWT token
const generateToken = (userId: string, username: string): string => {
  const JWT_SECRET =
    process.env['JWT_SECRET'] || 'a-string-secret-at-least-256-bits-long';
  const JWT_EXPIRE = process.env['JWT_EXPIRE'] || '30d';
  return jwt.sign({ userId, username }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  } as jwt.SignOptions);
};

// Clean validation using simple object iteration approach
const validateRegistrationInput = (
  username: string,
  password: string,
  userId: string
): string | null => {
  return validateRegistration(username, password, userId);
};

/**
 * POST /api/auth/userIdExists
 * User Id validation Endpoint
 */
export const userIdExists = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.body;

    const validationError = validateUserIdOnly(userId);
    if (validationError) {
      res.status(400).json({
        error: 'Validation failed',
        message: validationError,
      });
      return;
    }

    const trimmedUserId = userId.trim();
    // Check if userId already exists
    if (User.userIdExists(trimmedUserId)) {
      res.status(409).json({
        error: 'Conflict',
        message: 'UserId already exists',
      });
      return;
    }

    // UserId is available
    res.status(200).json({
      success: true,
      message: 'UserId is available',
    });
  } catch (error) {
    console.error('UserIdExists error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during validating user id',
    });
  }
};

/**
 * POST /api/auth/register
 * User Registration Endpoint
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, userId }: RegisterRequest = req.body;

    // Validate input
    const validationError = validateRegistrationInput(
      username,
      password,
      userId
    );
    if (validationError) {
      res.status(400).json({
        error: 'Validation failed',
        message: validationError,
      });
      return;
    }

    const trimmedUsername = username.trim();
    const trimmedUserId = userId.trim();

    // Check if userId already exists
    if (User.userIdExists(trimmedUserId)) {
      res.status(409).json({
        error: 'Conflict',
        message: 'UserId already exists',
      });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new user with custom userId
    User.create(trimmedUsername, passwordHash, trimmedUserId);

    // Success response (no token sent)
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please login to continue.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during registration',
    });
  }
};

/**
 * POST /api/auth/login
 * User Login Endpoint
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, password }: { userId?: string; password?: string } =
      req.body;

    // Clean validation using the simple validator
    const validationError = validateLogin(userId || '', password || '');
    if (validationError) {
      res.status(400).json({
        error: validationError,
      });
      return;
    }

    // At this point we know userId and password are valid strings
    const validUserId = userId!;
    const validPassword = password!;

    // Check if user exists
    const user = User.findByUserId(validUserId);
    if (!user) {
      res.status(401).json({
        error: 'Invalid credentials',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      validPassword,
      user.password_hash
    );
    if (!isPasswordValid) {
      res.status(401).json({
        error: 'Invalid credentials',
      });
      return;
    }

    // Generate JWT token
    const token = generateToken(user.userId, user.username);

    // Success response with token only (user data is in JWT payload)
    res.status(200).json({
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

/**
 * GET /api/auth/profile
 * Get User Profile (placeholder for later implementation)
 */
export const getProfile = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    // TODO: Implement profile endpoint with auth middleware later
    res.status(501).json({
      error: 'Not Implemented',
      message: 'Profile endpoint will be implemented later',
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching profile',
    });
  }
};
