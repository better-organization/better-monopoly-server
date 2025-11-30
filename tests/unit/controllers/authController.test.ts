import request, { Response } from 'supertest';
import app from '../../../src/server';
import { User } from '../../../src/models/User';

describe('Auth Controller', () => {
  // Clear storage before each test
  beforeEach(() => {
    User.clearStorage();
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
      expect(response.body.error).toBe('Conflict');
      expect(response.body.message).toBe('UserId already exists');
    });

    it('should return 400 when userId is missing', async () => {
      const response = await request(app)
        .post('/api/auth/userIdExists')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.message).toBe('UserId is required');
    });

    it('should return 400 when userId is not a string', async () => {
      const response = await request(app).post('/api/auth/userIdExists').send({
        userId: 123,
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.message).toBe('UserId must be a string');
    });

    it('should return 400 when userId is too short', async () => {
      const response = await request(app).post('/api/auth/userIdExists').send({
        userId: 'ab',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.message).toBe(
        'UserId must be at least 3 characters long'
      );
    });

    it('should return 400 when userId has invalid characters', async () => {
      const response = await request(app).post('/api/auth/userIdExists').send({
        userId: 'user@id!',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
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
      expect(response.body.error).toBe('Validation failed');
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
      expect(response.body.error).toBe('Validation failed');
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
      expect(response.body.error).toBe('Validation failed');
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
      expect(response.body.error).toBe('Validation failed');
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
      expect(response.body.error).toBe('Validation failed');
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
      expect(response.body.error).toBe('Conflict');
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
      const allUsers = User.getAllUsers();
      expect(allUsers).toHaveLength(1);
      expect(allUsers[0]!.username).toBe('testuser');
      expect(allUsers[0]!.userId).toBe('test-user-123');
      expect(allUsers[0]!.password_hash).not.toBe('testpass123'); // Password should be hashed
      expect(allUsers[0]!.password_hash).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash format
    });

    it('should trim username and userId', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: '  testuser  ',
        password: 'testpass123',
        userId: '  test-user-123  ',
      });

      expect(response.status).toBe(201);

      const allUsers = User.getAllUsers();
      expect(allUsers[0]!.username).toBe('testuser'); // Trimmed
      expect(allUsers[0]!.userId).toBe('test-user-123'); // Trimmed
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
      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');
      expect(response.body.userId).toBeUndefined(); // Should not be in response
      expect(response.body.username).toBeUndefined(); // Should not be in response

      // Verify JWT token structure
      const tokenParts = response.body.token.split('.');
      expect(tokenParts).toHaveLength(3);

      // Decode and verify payload contains both userId and username
      const payload = JSON.parse(
        Buffer.from(tokenParts[1], 'base64').toString()
      );
      expect(payload.userId).toBe('test-user-123');
      expect(payload.username).toBe('testuser');
      expect(payload.iat).toBeDefined();
      expect(payload.exp).toBeDefined();
    });

    it('should return 400 when userId is missing', async () => {
      const response = await request(app).post('/api/auth/login').send({
        password: 'testpass123',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Both userId and password are required');
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app).post('/api/auth/login').send({
        userId: 'test-user-123',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Both userId and password are required');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app).post('/api/auth/login').send({
        userId: 'non-existent-user',
        password: 'testpass123',
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        userId: 'test-user-123',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
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

  describe('Rate Limiting', () => {
    it('should be disabled in test environment', async () => {
      // Make multiple requests quickly - should not be rate limited in tests
      const promises: Promise<Response>[] = [];
      for (let i = 0; i < 6; i++) {
        promises.push(
          request(app)
            .post('/api/auth/userIdExists')
            .send({ userId: `test-user-${i}` })
        );
      }

      const responses = await Promise.all(promises);

      // All requests should succeed (no rate limiting in test environment)
      responses.forEach(response => {
        expect([200, 400].includes(response.status)).toBe(true);
        expect(response.status).not.toBe(429); // Should not be rate limited
      });
    });
  });
});
