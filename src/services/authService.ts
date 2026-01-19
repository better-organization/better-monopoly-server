// Authentication Service Layer - Business Logic
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import {
  validateRegistration,
  validateLogin,
  validateUserIdOnly,
} from '../utils/validation';
import { RESPONSE_MESSAGES } from '../utils/responseMessages';
import * as dotenv from 'dotenv';
import { tokenUtil } from '../utils/TokenUtil';

dotenv.config();
const SALT_ROUNDS = 12;

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
      const exists = await User.userIdExists(trimmedUserId);

      if (exists) {
        return {
          success: false,
          error: RESPONSE_MESSAGES.USERID_ALREADY_EXISTS,
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
            : RESPONSE_MESSAGES.VALIDATION_SERVICE_ERROR,
      };
    }
  }

  static async registerUser(
    data: RegisterData
  ): Promise<AuthServiceResponse<RegisterResponseData>> {
    try {
      const { username, password, userId } = data;

      validateRegistration(username, password, userId);

      const trimmedUsername = username.trim();
      const trimmedUserId = userId.trim();

      if (await User.userIdExists(trimmedUserId)) {
        return {
          success: false,
          error: RESPONSE_MESSAGES.USERID_ALREADY_EXISTS,
        };
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      await User.createUser(trimmedUsername, passwordHash, trimmedUserId);

      return {
        success: true,
        data: {
          message: RESPONSE_MESSAGES.USER_REGISTRATION_SUCCESS,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error?.message
            : RESPONSE_MESSAGES.REGISTRATION_SERVICE_ERROR,
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
      const user = await User.findByUserId(userId);
      if (!user) {
        return {
          success: false,
          error: RESPONSE_MESSAGES.INVALID_CREDENTIALS,
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return {
          success: false,
          error: RESPONSE_MESSAGES.INVALID_CREDENTIALS,
        };
      }

      const token = tokenUtil.generateAuthToken(user.userId, user.username);

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
            : RESPONSE_MESSAGES.LOGIN_SERVICE_ERROR,
      };
    }
  }
}
