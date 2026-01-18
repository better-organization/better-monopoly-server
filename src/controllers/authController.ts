import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { RESPONSE_MESSAGES } from '../utils/responseMessages';
import { cookieUtil } from '../utils/cookieUtil';

interface RegisterRequest {
  username: string;
  password: string;
  userId: string;
}

export const userIdExists = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.body;

    const result = await AuthService.validateUserIdExists(userId);

    const statusCode = result.success
      ? 200
      : result.error === RESPONSE_MESSAGES.USERID_ALREADY_EXISTS
        ? 409
        : 400;

    res.status(statusCode).json({
      success: result.success,
      message: result.success
        ? RESPONSE_MESSAGES.USERID_AVAILABLE
        : result.error,
    });
  } catch (error) {
    console.error('UserIdExists error:', error);
    res.status(500).json({
      success: false,
      message: RESPONSE_MESSAGES.VALIDATION_ERROR,
    });
  }
};

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
      : result.error === RESPONSE_MESSAGES.USERID_ALREADY_EXISTS
        ? 409
        : 400;

    res.status(statusCode).json({
      success: result.success,
      message: result.success
        ? result.data?.message || RESPONSE_MESSAGES.USER_REGISTERED_SUCCESSFULLY
        : result.error,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: RESPONSE_MESSAGES.REGISTRATION_ERROR,
    });
  }
};

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
      : result.error === RESPONSE_MESSAGES.INVALID_CREDENTIALS
        ? 401
        : 400;

    // Set cookie with proper configuration for cross-origin requests
    if (result.success && result.data?.token) {
      cookieUtil.setCookie(res, 'auth_token', result.data.token, 24);
    }

    // Success response
    res.status(statusCode).json({
      success: result.success,
      message: result.success
        ? RESPONSE_MESSAGES.LOGIN_SUCCESSFUL
        : result.error,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: RESPONSE_MESSAGES.LOGIN_ERROR,
    });
  }
};

export const getProfile = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    // TODO: Implement profile endpoint with auth middleware later
    res.status(501).json({
      success: false,
      message: RESPONSE_MESSAGES.PROFILE_NOT_IMPLEMENTED,
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: RESPONSE_MESSAGES.PROFILE_ERROR,
    });
  }
};

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
      message: RESPONSE_MESSAGES.LOGGED_OUT_SUCCESSFULLY,
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: RESPONSE_MESSAGES.LOGOUT_ERROR,
    });
  }
};
