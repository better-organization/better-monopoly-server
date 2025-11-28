import request from 'supertest';
import app from '../src/server';

describe('Game Endpoints', () => {
  describe('GET /api/game/test', () => {
    it('should return game service status', async () => {
      const response = await request(app).get('/api/game/test').expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Game service is working!',
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });

  // TODO: Add tests for game endpoints when implemented
  // describe('POST /api/game/create', () => { ... });
  // describe('GET /api/game/:gameId', () => { ... });
  // describe('POST /api/game/:gameId/join', () => { ... });
  // describe('POST /api/game/:gameId/move', () => { ... });
  // describe('GET /api/game/:gameId/status', () => { ... });
});
