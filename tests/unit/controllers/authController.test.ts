import request from 'supertest';
import app from '../../../src/server';
import { User } from '../../../src/models/User';

describe('Auth Controller', () => {
  // Clear database before each test
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/userIdExists', () => {
    it('should return 200 when userId is available', async () => {
      const response = await request(app).post('/api/auth/userIdExists').send({
        userId: 'test-user-123',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('UserId is available');
    });

    it('should return 409 when userId already exists', async () => {
      // First, create a user
      await request(app).post('/api/auth/register').send({
        username: 'testuser',
        password: 'testpass123',
        userId: 'existing-user-id',
      });

      // Then check if the userId exists
      const response = await request(app).post('/api/auth/userIdExists').send({
        userId: 'existing-user-id',
      });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('UserId already exists');
    });

    it('should return 400 when userId is missing', async () => {
      const response = await request(app)
        .post('/api/auth/userIdExists')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('UserId is required');
    });

    it('should return 400 when userId is not a string', async () => {
      const response = await request(app).post('/api/auth/userIdExists').send({
        userId: 123,
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('UserId must be a string');
    });

    it('should return 400 when userId is too short', async () => {
      const response = await request(app).post('/api/auth/userIdExists').send({
        userId: 'ab',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'UserId must be at least 3 characters long'
      );
    });

    it('should return 400 when userId has invalid characters', async () => {
      const response = await request(app).post('/api/auth/userIdExists').send({
        userId: 'user@id!',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'UserId can only contain letters, numbers, underscores, and hyphens'
      );
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        password: 'testpass123',
        userId: 'test-user-123',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        'User registered successfully. Please login to continue.'
      );
      expect(response.body.token).toBeUndefined(); // No token should be returned
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        // missing password and userId
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Username, password, and userId are required'
      );
    });

    it('should return 400 when fields are not strings', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 123,
        password: 'testpass123',
        userId: 'test-user-123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Username, password, and userId must be strings'
      );
    });

    it('should return 400 when username is too short', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'ab',
        password: 'testpass123',
        userId: 'test-user-123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Username must be at least 3 characters long'
      );
    });

    it('should return 400 when password is too short', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        password: '12345',
        userId: 'test-user-123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Password must be at least 6 characters long'
      );
    });

    it('should return 400 when username has invalid characters', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'test@user!',
        password: 'testpass123',
        userId: 'test-user-123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Username can only contain letters, numbers, and underscores'
      );
    });

    it('should return 409 when userId already exists', async () => {
      // First registration
      await request(app).post('/api/auth/register').send({
        username: 'testuser1',
        password: 'testpass123',
        userId: 'duplicate-user-id',
      });

      // Second registration with same userId
      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser2',
        password: 'testpass123',
        userId: 'duplicate-user-id',
      });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('UserId already exists');
    });

    it('should hash password correctly', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        password: 'testpass123',
        userId: 'test-user-123',
      });

      expect(response.status).toBe(201);

      // Check that the user was created and password was hashed
      const user = await User.findByUserId('test-user-123');
      expect(user).toBeTruthy();
      expect(user?.username).toBe('testuser');
      expect(user?.userId).toBe('test-user-123');
      expect(user?.passwordHash).not.toBe('testpass123'); // Password should be hashed
      expect(user?.passwordHash).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash format
    });

    it('should trim username and userId', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: '  testuser  ',
        password: 'testpass123',
        userId: '  test-user-123  ',
      });

      expect(response.status).toBe(201);

      const user = await User.findByUserId('test-user-123');
      expect(user?.username).toBe('testuser'); // Trimmed
      expect(user?.userId).toBe('test-user-123'); // Trimmed
    });

    it('should not return JWT token on registration', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        password: 'testpass123',
        userId: 'test-user-123',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeUndefined(); // No token should be returned
      expect(response.body.message).toBe(
        'User registered successfully. Please login to continue.'
      );
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user first
      await request(app).post('/api/auth/register').send({
        username: 'testuser',
        password: 'testpass123',
        userId: 'test-user-123',
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        userId: 'test-user-123',
        password: 'testpass123',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.userId).toBeUndefined();
      expect(response.body.username).toBeUndefined();

      // Check if Set-Cookie header exists
      const setCookieHeader = response.headers['set-cookie'] as
        | string[]
        | undefined;
      expect(setCookieHeader).toBeDefined();
      expect(Array.isArray(setCookieHeader)).toBe(true);

      // Find the auth_token cookie
      const authCookie = setCookieHeader?.find((cookie: string) =>
        cookie.startsWith('auth_token=')
      );
      expect(authCookie).toBeDefined();

      // Extract and verify the token from the cookie
      const tokenMatch = authCookie?.match(/auth_token=([^;]+)/);
      expect(tokenMatch).toBeDefined();
      const token = tokenMatch?.[1];
      expect(token).toBeDefined();

      // Verify JWT token structure
      const tokenParts = token?.split('.');
      expect(tokenParts).toHaveLength(3);

      // Decode and verify payload
      const payload = JSON.parse(
        Buffer.from(tokenParts![1]!, 'base64').toString('utf-8')
      );
      expect(payload.userId).toBe('test-user-123');
      expect(payload.username).toBe('testuser');
      expect(payload.iat).toBeDefined();
      expect(payload.exp).toBeDefined();

      // Verify cookie attributes
      expect(authCookie).toContain('HttpOnly');
      expect(authCookie).toContain('Path=/');
      expect(authCookie).toContain('SameSite=Lax');
    });

    it('should return 400 when userId is missing', async () => {
      const response = await request(app).post('/api/auth/login').send({
        password: 'testpass123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Both userId and password are required'
      );
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app).post('/api/auth/login').send({
        userId: 'test-user-123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Both userId and password are required'
      );
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app).post('/api/auth/login').send({
        userId: 'non-existent-user',
        password: 'testpass123',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        userId: 'test-user-123',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return 501 (not implemented)', async () => {
      const response = await request(app).get('/api/auth/profile');

      expect(response.status).toBe(501);
      expect(response.body.error).toBe('Not Implemented');
      expect(response.body.message).toBe(
        'Profile endpoint will be implemented later'
      );
    });
  });

  describe('GET /api/auth/test', () => {
    it('should return test message', async () => {
      const response = await request(app).get('/api/auth/test');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Authentication service is working!');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
