// Authentication Service Tests
import { AuthService } from '../../../src/services/authService';
import { User } from '../../../src/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ERROR_MESSAGES } from '../../../src/utils/errorMessages';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock jwt
jest.mock('jsonwebtoken');
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('AuthService - MongoDB with Separate Collections', () => {
  // Cleanup: Clear database and reset mocks after each test
  afterEach(async () => {
    await User.deleteMany({});
    jest.clearAllMocks();
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
      // Create a user first
      await User.createUser('existinguser', 'hashedpass', 'validUser123');

      const result = await AuthService.validateUserIdExists('validUser123');

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.USERID_ALREADY_EXISTS);
    });

    it('should return success when userId is available', async () => {
      const result = await AuthService.validateUserIdExists('validUser123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ available: true });
    });

    it('should trim userId before checking', async () => {
      const result = await AuthService.validateUserIdExists('  validUser123  ');

      expect(result.success).toBe(true);
    });
  });

  describe('registerUser', () => {
    const validRegisterData = {
      username: 'testuser',
      password: 'password123',
      userId: 'user123',
    };

    beforeEach(() => {
      // Mock bcrypt.hash to return a fixed hash
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword123');
    });

    it('should return error for missing required fields', async () => {
      const result = await AuthService.registerUser({
        username: '',
        password: 'password123',
        userId: 'user123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.REGISTRATION_REQUIRED_FIELDS);
    });

    it('should return error for non-string fields', async () => {
      const result = await AuthService.registerUser({
        username: 123 as any,
        password: 'password123',
        userId: 'user123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.REGISTRATION_FIELD_TYPES);
    });

    it('should return error for short username', async () => {
      const result = await AuthService.registerUser({
        username: 'ab',
        password: 'password123',
        userId: 'user123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.USERNAME_MIN_LENGTH);
    });

    it('should return error for short password', async () => {
      const result = await AuthService.registerUser({
        username: 'testuser',
        password: '123',
        userId: 'user123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.PASSWORD_MIN_LENGTH);
    });

    it('should return error for invalid username pattern', async () => {
      const result = await AuthService.registerUser({
        username: 'test@user',
        password: 'password123',
        userId: 'user123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.USERNAME_PATTERN);
    });

    it('should return error when userId already exists', async () => {
      // Create a user first
      await User.createUser('existinguser', 'hashedpass', 'user123');

      const result = await AuthService.registerUser(validRegisterData);

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.USERID_ALREADY_EXISTS);
    });

    it('should successfully register user with valid data', async () => {
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');

      const result = await AuthService.registerUser(validRegisterData);

      expect(result.success).toBe(true);
      expect(result.data?.message).toBe(
        'User registered successfully. Please login to continue.'
      );
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 12);

      // Verify user was created in database
      const user = await User.findByUserId('user123');
      expect(user).toBeTruthy();
      expect(user?.username).toBe('testuser');
      expect(user?.userId).toBe('user123');
    });

    it('should trim username and userId before processing', async () => {
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');

      const result = await AuthService.registerUser({
        username: '  testuser  ',
        password: 'password123',
        userId: '  user123  ',
      });

      expect(result.success).toBe(true);

      // Verify user was created with trimmed values
      const user = await User.findByUserId('user123');
      expect(user?.username).toBe('testuser');
      expect(user?.userId).toBe('user123');
    });
  });

  describe('loginUser', () => {
    const validLoginData = {
      userId: 'user123',
      password: 'password123',
    };

    beforeEach(async () => {
      // Mock bcrypt compare
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
      // Mock jwt sign
      (mockedJwt.sign as jest.Mock).mockReturnValue('jwt.token.here');
    });

    it('should return error for missing required fields', async () => {
      const result = await AuthService.loginUser({
        userId: '',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.LOGIN_REQUIRED_FIELDS);
    });

    it('should return error for non-string fields', async () => {
      const result = await AuthService.loginUser({
        userId: 123 as any,
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.LOGIN_FIELD_TYPES);
    });

    it('should return error when user does not exist', async () => {
      const result = await AuthService.loginUser(validLoginData);

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INVALID_CREDENTIALS);
    });

    it('should return error for invalid password', async () => {
      // Create user first
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      await User.createUser('testuser', 'hashedPassword123', 'user123');

      // Mock bcrypt compare to return false (invalid password)
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await AuthService.loginUser(validLoginData);

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INVALID_CREDENTIALS);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123'
      );
    });

    it('should successfully login with valid credentials', async () => {
      // Create user first
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      await User.createUser('testuser', 'hashedPassword123', 'user123');

      // Mock bcrypt compare to return true
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await AuthService.loginUser(validLoginData);

      expect(result.success).toBe(true);
      expect(result.data?.token).toBe('jwt.token.here');
      expect(result.data?.expires).toBeInstanceOf(Date);
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        { userId: 'user123', username: 'testuser' },
        expect.any(String),
        { expiresIn: expect.any(String) }
      );
    });

    it('should handle bcrypt comparison errors', async () => {
      // Create user first
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      await User.createUser('testuser', 'hashedPassword123', 'user123');

      (mockedBcrypt.compare as jest.Mock).mockRejectedValue(
        new Error('Bcrypt error')
      );

      const result = await AuthService.loginUser(validLoginData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Bcrypt error');
    });
  });
});
