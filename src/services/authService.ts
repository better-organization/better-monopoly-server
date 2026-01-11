// Authentication Service Layer - Business Logic
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import {
  validateRegistration,
  validateLogin,
  validateUserIdOnly,
} from '../utils/validation';
import { ERROR_MESSAGES } from '../utils/errorMessages';
import * as dotenv from 'dotenv';
import { Token } from '../models/Token';

dotenv.config();

// Service interfaces
export interface AuthServiceResponse<
  T = RegisterResponseData | LoginResponseData | UserIdCheckResponseData,
> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RegisterData {
  username: string;
  password: string;
  userId: string;
}

export interface LoginData {
  userId: string;
  password: string;
}

export interface RegisterResponseData {
  message: string;
}

export interface LoginResponseData {
  token: string;
}

export interface UserIdCheckResponseData {
  available: boolean;
}

export class AuthService {
  static async validateUserIdExists(
    userId: string
  ): Promise<AuthServiceResponse<UserIdCheckResponseData>> {
    try {
      validateUserIdOnly(userId);

      const trimmedUserId = userId.trim();
      const exists = User.userIdExists(trimmedUserId);

      if (exists) {
        return {
          success: false,
          error: ERROR_MESSAGES.USERID_ALREADY_EXISTS,
        };
      }

      return {
        success: true,
        data: { available: true },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error?.message
            : 'An error occurred during login',
      };
    }
  }

  /**
   * Register a new user
   */
  static async registerUser(
    data: RegisterData
  ): Promise<AuthServiceResponse<RegisterResponseData>> {
    try {
      const { username, password, userId } = data;

      validateRegistration(username, password, userId);

      const trimmedUsername = username.trim();
      const trimmedUserId = userId.trim();

      // Check if userId already exists
      if (User.userIdExists(trimmedUserId)) {
        return {
          success: false,
          error: ERROR_MESSAGES.USERID_ALREADY_EXISTS,
        };
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create new user
      User.create(trimmedUsername, passwordHash, trimmedUserId);

      return {
        success: true,
        data: {
          message: 'User registered successfully. Please login to continue.',
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error?.message
            : 'An error occurred during login',
      };
    }
  }

  /**
   * Login user and return JWT token
   */
  static async loginUser(
    data: LoginData
  ): Promise<AuthServiceResponse<LoginResponseData>> {
    try {
      const { userId, password } = data;

      validateLogin(userId, password);

      // Check if user exists
      const user = User.findByUserId(userId);
      if (!user) {
        return {
          success: false,
          error: ERROR_MESSAGES.INVALID_CREDENTIALS,
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
      );
      if (!isPasswordValid) {
        return {
          success: false,
          error: ERROR_MESSAGES.INVALID_CREDENTIALS,
        };
      }

      const token = Token.generateToken(user.userId, user.username);

      return {
        success: true,
        data: { token },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error?.message
            : 'An error occurred during login',
      };
    }
  }
}
