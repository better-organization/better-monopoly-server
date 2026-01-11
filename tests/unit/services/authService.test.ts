// Authentication Service Tests
import { AuthService } from '../../../src/services/authService';
import { User } from '../../../src/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ERROR_MESSAGES } from '../../../src/utils/errorMessages';

// Mock the User model
jest.mock('../../../src/models/User');
const MockedUser = User as jest.Mocked<typeof User>;

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock jwt
jest.mock('jsonwebtoken');
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('AuthService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset User storage before each test
    (MockedUser.userIdExists as jest.Mock).mockReturnValue(false);
    (MockedUser.findByUserId as jest.Mock).mockReturnValue(null);
    (MockedUser.create as jest.Mock).mockImplementation(() => {});
  });

  describe('validateUserIdExists', () => {
    it('should return error for missing userId', async () => {
      const result = await AuthService.validateUserIdExists('');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.USERID_REQUIRED);
    });

    it('should return error for non-string userId', async () => {
      const result = await AuthService.validateUserIdExists(123 as any);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.USERID_TYPE);
    });

    it('should return error for short userId', async () => {
      const result = await AuthService.validateUserIdExists('ab');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.USERID_MIN_LENGTH);
    });

    it('should return error for invalid userId pattern', async () => {
      const result = await AuthService.validateUserIdExists('user@123');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.USERID_PATTERN);
    });

    it('should return error when userId already exists', async () => {
      (MockedUser.userIdExists as jest.Mock).mockReturnValue(true);
      
      const result = await AuthService.validateUserIdExists('validUser123');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.USERID_ALREADY_EXISTS);
      expect(MockedUser.userIdExists).toHaveBeenCalledWith('validUser123');
    });

    it('should return success when userId is available', async () => {
      (MockedUser.userIdExists as jest.Mock).mockReturnValue(false);
      
      const result = await AuthService.validateUserIdExists('validUser123');
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ available: true });
      expect(MockedUser.userIdExists).toHaveBeenCalledWith('validUser123');
    });

    it('should trim userId before checking', async () => {
      (MockedUser.userIdExists as jest.Mock).mockReturnValue(false);
      
      const result = await AuthService.validateUserIdExists('  validUser123  ');
      
      expect(result.success).toBe(true);
      expect(MockedUser.userIdExists).toHaveBeenCalledWith('validUser123');
    });
  });

  describe('registerUser', () => {
    const validRegisterData = {
      username: 'testuser',
      password: 'password123',
      userId: 'user123'
    };

    it('should return error for missing required fields', async () => {
      const result = await AuthService.registerUser({
        username: '',
        password: 'password123',
        userId: 'user123'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.REGISTRATION_REQUIRED_FIELDS);
    });

    it('should return error for non-string fields', async () => {
      const result = await AuthService.registerUser({
        username: 123 as any,
        password: 'password123',
        userId: 'user123'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.REGISTRATION_FIELD_TYPES);
    });

    it('should return error for short username', async () => {
      const result = await AuthService.registerUser({
        username: 'ab',
        password: 'password123',
        userId: 'user123'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.USERNAME_MIN_LENGTH);
    });

    it('should return error for short password', async () => {
      const result = await AuthService.registerUser({
        username: 'testuser',
        password: '123',
        userId: 'user123'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.PASSWORD_MIN_LENGTH);
    });

    it('should return error for invalid username pattern', async () => {
      const result = await AuthService.registerUser({
        username: 'test@user',
        password: 'password123',
        userId: 'user123'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.USERNAME_PATTERN);
    });

    it('should return error when userId already exists', async () => {
      (MockedUser.userIdExists as jest.Mock).mockReturnValue(true);
      
      const result = await AuthService.registerUser(validRegisterData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.USERID_ALREADY_EXISTS);
    });

    it('should successfully register user with valid data', async () => {
      (MockedUser.userIdExists as jest.Mock).mockReturnValue(false);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      
      const result = await AuthService.registerUser(validRegisterData);
      
      expect(result.success).toBe(true);
      expect(result.data?.message).toBe('User registered successfully. Please login to continue.');
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(MockedUser.create).toHaveBeenCalledWith('testuser', 'hashedPassword123', 'user123');
    });

    it('should trim username and userId before processing', async () => {
      (MockedUser.userIdExists as jest.Mock).mockReturnValue(false);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      
      const result = await AuthService.registerUser({
        username: '  testuser  ',
        password: 'password123',
        userId: '  user123  '
      });
      
      expect(result.success).toBe(true);
      expect(MockedUser.userIdExists).toHaveBeenCalledWith('user123');
      expect(MockedUser.create).toHaveBeenCalledWith('testuser', 'hashedPassword123', 'user123');
    });
  });

  describe('loginUser', () => {
    const validLoginData = {
      userId: 'user123',
      password: 'password123'
    };

    it('should return error for missing required fields', async () => {
      const result = await AuthService.loginUser({
        userId: '',
        password: 'password123'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.LOGIN_REQUIRED_FIELDS);
    });

    it('should return error for non-string fields', async () => {
      const result = await AuthService.loginUser({
        userId: 123 as any,
        password: 'password123'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.LOGIN_FIELD_TYPES);
    });

    it('should return error when user does not exist', async () => {
      (MockedUser.findByUserId as jest.Mock).mockReturnValue(null);
      
      const result = await AuthService.loginUser(validLoginData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INVALID_CREDENTIALS);
      expect(MockedUser.findByUserId).toHaveBeenCalledWith('user123');
    });

    it('should return error for invalid password', async () => {
      const mockUser = {
        id: 1,
        userId: 'user123',
        username: 'testuser',
        password_hash: 'hashedPassword123'
      };
      (MockedUser.findByUserId as jest.Mock).mockReturnValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);
      
      const result = await AuthService.loginUser(validLoginData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INVALID_CREDENTIALS);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword123');
    });

    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: 1,
        userId: 'user123',
        username: 'testuser',
        password_hash: 'hashedPassword123'
      };
      (MockedUser.findByUserId as jest.Mock).mockReturnValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockedJwt.sign as jest.Mock).mockReturnValue('jwt.token.here');
      
      const result = await AuthService.loginUser(validLoginData);
      
      expect(result.success).toBe(true);
      expect(result.data?.token).toBe('jwt.token.here');
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        { userId: 'user123', username: 'testuser', roomCode: null, gameId: null },
        expect.any(String),
        { expiresIn: expect.any(String) }
      );
    });

    it('should handle bcrypt comparison errors', async () => {
      const mockUser = {
        id: 1,
        userId: 'user123',
        username: 'testuser',
        password_hash: 'hashedPassword123'
      };
      (MockedUser.findByUserId as jest.Mock).mockReturnValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockRejectedValue(new Error('Bcrypt error'));
      
      const result = await AuthService.loginUser(validLoginData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Bcrypt error');
    });
  });
});
