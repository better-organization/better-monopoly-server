import request from 'supertest';
import app from '../../src/app';

describe('Auth Routes - Integration Tests', () => {
  describe('POST /api/v1/auth/login', () => {
    it('should successfully login a user with valid credentials', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        username: 'test_user',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should handle multiple login requests', async () => {
      const users = ['user1', 'user2', 'user3'];

      for (const username of users) {
        const response = await request(app).post('/api/v1/auth/login').send({
          username,
        });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'Better-Monopoly-Server');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/v1/unknown-route');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });
});
