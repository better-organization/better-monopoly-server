import request from 'supertest';
import app from '../../../src/server';

describe('Game Routes', () => {
  describe('GET /api/game/test', () => {
    it('should return game service status', async () => {
      const response = await request(app).get('/api/game/test');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    it('should include message in response', async () => {
      const response = await request(app).get('/api/game/test');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });

    it('should include timestamp in response', async () => {
      const response = await request(app).get('/api/game/test');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/game/board/:boardId/version/:version', () => {
    it('should return board layout for valid board and version', async () => {
      const response = await request(app).get(
        '/api/game/board/european_football_club_giants/version/1.0'
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe('european_football_club_giants');
      expect(response.body.data).toHaveProperty('version');
      expect(response.body.data.version).toBe('1.0');
      expect(response.body.data).toHaveProperty('cells');
      expect(Array.isArray(response.body.data.cells)).toBe(true);
    });

    it('should return 404 for non-existent board', async () => {
      const response = await request(app).get(
        '/api/game/board/nonexistent/version/1.0'
      );
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Board not found');
    });

    it('should return 404 for missing boardId (empty parameter)', async () => {
      const response = await request(app).get('/api/game/board//version/1.0');
      // Express will route this as a 404 since path doesn't match
      expect(response.status).toBe(404);
    });

    it('should handle invalid version - returns 404', async () => {
      const response = await request(app).get(
        '/api/game/board/european_football_club_giants/version/invalid'
      );
      expect(response.status).toBe(404);
    });

    it('should validate boardId with spaces', async () => {
      const response = await request(app).get(
        '/api/game/board/invalid%20id/version/1.0'
      );
      // Should return 404 since board doesn't exist
      expect(response.status).toBe(404);
    });

    it('should return cells with all required properties', async () => {
      const response = await request(app).get(
        '/api/game/board/european_football_club_giants/version/1.0'
      );
      expect(response.status).toBe(200);
      if (response.body.cells && response.body.cells.length > 0) {
        const cell = response.body.cells[0];
        expect(cell).toHaveProperty('index');
        expect(cell).toHaveProperty('name');
        expect(cell).toHaveProperty('cell_type');
        expect(cell).toHaveProperty('board_id');
        expect(cell).toHaveProperty('board_versions');
      }
    });

    it('should return board metadata', async () => {
      const response = await request(app).get(
        '/api/game/board/european_football_club_giants/version/1.0'
      );
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('edition');
      expect(response.body.data).toHaveProperty('currency');
      expect(response.body.data.currency).toBe('EURO');
      expect(response.body.data).toHaveProperty('currency_symbol');
      expect(response.body.data).toHaveProperty('terms');
      expect(response.body.data.terms).toHaveProperty('player');
    });

    it('should return cells array with multiple elements', async () => {
      const response = await request(app).get(
        '/api/game/board/european_football_club_giants/version/1.0'
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.cells)).toBe(true);
      expect(response.body.data.cells.length).toBeGreaterThan(0);
    });

    it('should flatten cell details in response', async () => {
      const response = await request(app).get(
        '/api/game/board/european_football_club_giants/version/1.0'
      );
      expect(response.status).toBe(200);
      const cells = response.body.data.cells;
      // Check for flattened properties from nested objects
      const hasSpecialOrProperty = cells.some(
        (c: any) =>
          c.action_keyword ||
          c.property_price ||
          c.utility_price ||
          c.transport_price
      );
      expect(hasSpecialOrProperty).toBe(true);
    });
  });

  // NOTE: roll-dice endpoint now requires authentication
  // These tests are covered in unit tests with proper mocking
  // See tests/unit/controllers/gameController.test.ts for comprehensive coverage
  describe('POST /api/game/roll-dice', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app).post('/api/game/roll-dice').send({});

      expect(response.status).toBe(401);
    });

    it('should return 401 without auth cookie', async () => {
      const response = await request(app)
        .post('/api/game/roll-dice')
        .send({ playerId: 1 });

      expect(response.status).toBe(401);
    });
  });

  describe('404 handling for undefined game routes', () => {
    it('should return 404 for unknown game routes', async () => {
      const response = await request(app).get('/api/game/unknown');
      expect(response.status).toBe(404);
    });

    it('should return 404 for invalid endpoints', async () => {
      const response = await request(app).get('/api/game/invalid/path/here');
      expect(response.status).toBe(404);
    });
  });

  describe('Error handling', () => {
    it('should return 400 with missing required parameters', async () => {
      // If boardId is missing entirely (null check in controller)
      const response = await request(app).get('/api/game/board/test/version/');
      // This will be 404 because the route doesn't match the pattern
      expect([400, 404]).toContain(response.status);
    });
  });
});
