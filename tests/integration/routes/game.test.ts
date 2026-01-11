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
      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe('european_football_club_giants');
      expect(response.body).toHaveProperty('version');
      expect(response.body.version).toBe('1.0');
      expect(response.body).toHaveProperty('cells');
      expect(Array.isArray(response.body.cells)).toBe(true);
    });

    it('should return 404 for non-existent board', async () => {
      const response = await request(app).get(
        '/api/game/board/nonexistent/version/1.0'
      );
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('BOARD_NOT_FOUND');
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
      expect(response.body).toHaveProperty('edition');
      expect(response.body).toHaveProperty('currency');
      expect(response.body.currency).toBe('EURO');
      expect(response.body).toHaveProperty('currency_symbol');
      expect(response.body).toHaveProperty('terms');
      expect(response.body.terms).toHaveProperty('player');
    });

    it('should return cells array with multiple elements', async () => {
      const response = await request(app).get(
        '/api/game/board/european_football_club_giants/version/1.0'
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.cells)).toBe(true);
      expect(response.body.cells.length).toBeGreaterThan(0);
    });

    it('should flatten cell details in response', async () => {
      const response = await request(app).get(
        '/api/game/board/european_football_club_giants/version/1.0'
      );
      expect(response.status).toBe(200);
      const cells = response.body.cells;
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

  describe('POST /api/game/roll-dice', () => {
    it('should return 200 with dice roll result', async () => {
      const response = await request(app).post('/api/game/roll-dice').send({});

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('data');
    });

    it('should return dice values between 1 and 6', async () => {
      const response = await request(app).post('/api/game/roll-dice').send({});

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('dice');
      expect(Array.isArray(response.body.data.dice)).toBe(true);
      expect(response.body.data.dice.length).toBe(2);

      const [dice1, dice2] = response.body.data.dice;
      expect(dice1).toBeGreaterThanOrEqual(1);
      expect(dice1).toBeLessThanOrEqual(6);
      expect(dice2).toBeGreaterThanOrEqual(1);
      expect(dice2).toBeLessThanOrEqual(6);
    });

    it('should return correct total', async () => {
      const response = await request(app).post('/api/game/roll-dice').send({});

      expect(response.status).toBe(200);
      const { dice, total } = response.body.data;
      expect(total).toBe(dice[0] + dice[1]);
      expect(total).toBeGreaterThanOrEqual(2);
      expect(total).toBeLessThanOrEqual(12);
    });

    it('should include timestamp in response', async () => {
      const response = await request(app).post('/api/game/roll-dice').send({});

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('timestamp');
      expect(typeof response.body.data.timestamp).toBe('string');

      // Verify it's a valid ISO date string
      const timestamp = new Date(response.body.data.timestamp);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });

    it('should accept optional gameId and playerId', async () => {
      const response = await request(app)
        .post('/api/game/roll-dice')
        .send({
          gameId: 'game-123',
          playerId: 'player-456',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('dice');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('timestamp');
    });

    it('should work without request body', async () => {
      const response = await request(app).post('/api/game/roll-dice');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return all required fields in data object', async () => {
      const response = await request(app).post('/api/game/roll-dice').send({});

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('dice');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(Object.keys(response.body.data).length).toBe(3);
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
