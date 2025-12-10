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

    const statusCode = result.success
      ? 200
      : result.error === ERROR_MESSAGES.USERID_ALREADY_EXISTS
        ? 409
        : 400;

    res.status(statusCode).json({
      success: result.success,
      message: result.success ? 'UserId is available' : result.error,
    });
  } catch (error) {
    console.error('UserIdExists error:', error);
    res.status(500).json({
      success: false,
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

    const result = await AuthService.registerUser({
      username,
      password,
      userId,
    });

    const statusCode = result.success
      ? 201
      : result.error === ERROR_MESSAGES.USERID_ALREADY_EXISTS
        ? 409
        : 400;

    res.status(statusCode).json({
      success: result.success,
      message: result.success
        ? result.data?.message || 'User registered successfully'
        : result.error,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
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

    const statusCode = result.success
      ? 200
      : result.error === ERROR_MESSAGES.INVALID_CREDENTIALS
        ? 401
        : 400;

    // Set cookie with proper configuration for cross-origin requests
    if (result.success && result.data?.token) {
      const isProduction = process.env['NODE_ENV'] === 'production';

      res.cookie('auth_token', result.data.token, {
        httpOnly: true, // Prevents JavaScript access (XSS protection)
        secure: isProduction, // HTTPS only in production
        sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-origin in production
        expires: result.data.expires, // Cookie expiration date
        path: '/', // Available for all routes
        domain: process.env['COOKIE_DOMAIN'] || undefined, // Optional: for cross-subdomain cookies
      });
    }

    // Success response
    res.status(statusCode).json({
      success: result.success,
      message: result.success ? 'Login successful' : result.error,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login',
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
      success: false,
      message: 'An error occurred while fetching profile',
    });
  }
};

/**
 * POST /api/auth/logout
 * Logout User - Clear auth cookie
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    const isLocal = process.env['NODE_ENV'] === 'local';

    // Clear the auth cookie
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: !isLocal,
      sameSite: !isLocal ? 'none' : 'lax',
      path: '/',
      domain: process.env['COOKIE_DOMAIN'] || undefined,
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during logout',
    });
  }
};
