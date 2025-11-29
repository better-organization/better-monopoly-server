import request from 'supertest';
import app from '../src/server';

describe('Error Handling', () => {
  describe('404 Not Found', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          message: 'Route /api/non-existent-route not found',
        },
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should handle requests within rate limit', async () => {
      await request(app).get('/api/health').expect(200);
    });
  });
});
