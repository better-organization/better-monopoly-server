import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { ERROR_MESSAGES } from '../utils/errorMessages';

// Interface for request bodies
interface RegisterRequest {
  username: string;
  password: string;
  userId: string;
}

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

    // Use service layer for validation and business logic
    const result = await AuthService.validateUserIdExists(userId);

    if (!result.success) {
      const statusCode =
        result.error === ERROR_MESSAGES.USERID_ALREADY_EXISTS ? 409 : 400;
      const errorType =
        result.error === ERROR_MESSAGES.USERID_ALREADY_EXISTS
          ? 'Conflict'
          : 'Validation failed';

      res.status(statusCode).json({
        error: errorType,
        message: result.error,
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

    // Use service layer for registration business logic
    const result = await AuthService.registerUser({
      username,
      password,
      userId,
    });

    if (!result.success) {
      const statusCode =
        result.error === ERROR_MESSAGES.USERID_ALREADY_EXISTS ? 409 : 400;
      const errorType =
        result.error === ERROR_MESSAGES.USERID_ALREADY_EXISTS
          ? 'Conflict'
          : 'Validation failed';

      res.status(statusCode).json({
        error: errorType,
        message: result.error,
      });
      return;
    }

    // Success response (no token sent)
    res.status(201).json({
      success: true,
      message: result.data?.message || 'User registered successfully',
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

    // Use service layer for login business logic
    const result = await AuthService.loginUser({
      userId: userId || '',
      password: password || '',
    });

    if (!result.success) {
      const statusCode =
        result.error === ERROR_MESSAGES.INVALID_CREDENTIALS ? 401 : 400;

      res.status(statusCode).json({
        error: result.error,
      });
      return;
    }

    // Success response with token only (user data is in JWT payload)
    res.status(200).json({
      token: result.data?.token,
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
