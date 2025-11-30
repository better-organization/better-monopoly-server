import request from 'supertest';
import app from '../../../src/server';

describe('Health Routes', () => {
  describe('GET /api/health', () => {
    it('should return health status with success true', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    it('should return a health message', async () => {
      const response = await request(app).get('/api/health');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
      expect(response.body.message.length).toBeGreaterThan(0);
    });

    it('should return timestamp in response', async () => {
      const response = await request(app).get('/api/health');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.timestamp).toBe('string');
    });

    it('should return uptime', async () => {
      const response = await request(app).get('/api/health');
      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThan(0);
    });

    it('should return environment', async () => {
      const response = await request(app).get('/api/health');
      expect(response.body).toHaveProperty('environment');
      expect(typeof response.body.environment).toBe('string');
    });
  });

  describe('GET /api/health/ready', () => {
    it('should return readiness probe status', async () => {
      const response = await request(app).get('/api/health/ready');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    it('should indicate server is ready', async () => {
      const response = await request(app).get('/api/health/ready');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('ready');
    });
  });

  describe('GET /api/health/live', () => {
    it('should return liveness probe status', async () => {
      const response = await request(app).get('/api/health/live');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    it('should indicate server is alive', async () => {
      const response = await request(app).get('/api/health/live');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('alive');
    });
  });

  describe('GET /api/auth/test', () => {
    it('should return liveness status of auth', async () => {
      const response = await request(app).get('/api/auth/test').expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Authentication service is working!',
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
