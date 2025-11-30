import request from 'supertest';
import app from '../../../src/server';

describe('Auth Routes', () => {
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
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com', // Wrong field - should be userId
          password: 'password123',
          username: 'testuser',
        });

      // Should return validation error for missing userId field
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject register with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' }); // Missing required fields

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com', // Wrong field - should be userId
          password: 'password123',
        });

      // Should return validation error for missing userId field
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Both userId and password are required');
    });

    it('should reject login with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' }); // Missing required fields

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Both userId and password are required');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should handle logout request (endpoint not implemented)', async () => {
      const response = await request(app).post('/api/auth/logout').send();

      expect(response.status).toBe(404);
    });
  });

  describe('Auth error handling', () => {
    it('should return not found for unknown auth endpoints', async () => {
      const response = await request(app).get('/api/auth/unknown');
      expect(response.status).toBe(404);
    });
  });
});
