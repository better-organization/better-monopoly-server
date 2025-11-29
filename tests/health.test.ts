import request from 'supertest';
import app from '../src/server';

describe('Health Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health').expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Better Monopoly Server is healthy!',
        environment: 'test',
      });
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });
  });

  describe('GET /api/health/ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app).get('/api/health/ready').expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Server is ready to accept connections',
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('GET /api/health/live', () => {
    it('should return liveness status', async () => {
      const response = await request(app).get('/api/health/live').expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Server is alive',
      });
      expect(response.body.timestamp).toBeDefined();
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
