import request from 'supertest';
import app from '../../../src/server';
import { User } from '../../../src/models/User';

describe('Auth Routes - Integration with Separate Collections', () => {
  // Clear database before each test
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('GET /api/auth/test', () => {
    it('should return auth service status', async () => {
      const response = await request(app).get('/api/auth/test');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    it('should include message in response', async () => {
      const response = await request(app).get('/api/auth/test');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });

    it('should include timestamp in response', async () => {
      const response = await request(app).get('/api/auth/test');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should validate required fields', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com', // Wrong field - should be userId
        password: 'password123',
        username: 'testuser',
      });

      // Should return validation error for missing userId field
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Username, password, and userId are required'
      );
    });

    it('should reject register with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' }); // Missing required fields

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Username, password, and userId are required'
      );
    });

    it('should successfully register a new user', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        password: 'password123',
        userId: 'testuser123',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        'User registered successfully. Please login to continue.'
      );

      // Verify user was created in database
      const user = await User.findByUserId('testuser123');
      expect(user).toBeTruthy();
      expect(user?.username).toBe('testuser');
    });

    it('should reject duplicate userId', async () => {
      // First registration
      await request(app).post('/api/auth/register').send({
        username: 'testuser',
        password: 'password123',
        userId: 'testuser123',
      });

      // Second registration with same userId
      const response = await request(app).post('/api/auth/register').send({
        username: 'anotheruser',
        password: 'password123',
        userId: 'testuser123',
      });

      expect(response.status).toBe(409); // 409 Conflict for duplicate userId
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await request(app).post('/api/auth/register').send({
        username: 'testuser',
        password: 'password123',
        userId: 'testuser123',
      });
    });

    it('should validate required fields', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com', // Wrong field - should be userId
        password: 'password123',
      });

      // Should return validation error for missing userId field
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Both userId and password are required'
      );
    });

    it('should reject login with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' }); // Missing required fields

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Both userId and password are required'
      );
    });

    it('should successfully login with valid credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        userId: 'testuser123',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('expires');
    });

    it('should reject login with invalid credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        userId: 'testuser123',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject login with non-existent user', async () => {
      const response = await request(app).post('/api/auth/login').send({
        userId: 'nonexistent',
        password: 'password123',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should handle logout request (endpoint not implemented)', async () => {
      const response = await request(app).post('/api/auth/logout').send();

      expect(response.status).toBe(200);
    });
  });

  describe('Auth error handling', () => {
    it('should return not found for unknown auth endpoints', async () => {
      const response = await request(app).get('/api/auth/unknown');
      expect(response.status).toBe(404);
    });
  });
});
