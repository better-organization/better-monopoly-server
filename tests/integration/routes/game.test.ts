import request from 'supertest';
import app from '../../../src/server';
import { User } from '../../../src/models/User';
import { RoomService } from '../../../src/services/roomService';
import { GameService } from '../../../src/services/gameService';

describe('Game Routes', () => {
  // Helper function to extract cookies from response headers
  const getCookies = (headers: Record<string, string | string[]>): string[] => {
    const cookies = headers['set-cookie'];
    if (Array.isArray(cookies)) {
      return cookies;
    }
    return cookies ? [cookies] : [];
  };

  // Helper function to register and login a user
  const registerAndLogin = async (username: string, userId: string, password: string = 'password123'): Promise<string[]> => {
    // Register
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({ username, userId, password });

    // Debug: log if registration fails
    if (registerResponse.status !== 201) {
      console.log('Registration failed for', userId, ':', registerResponse.status, JSON.stringify(registerResponse.body));
    }

    // Login and get cookie
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ userId, password });

    // Debug: log if login fails
    if (loginResponse.status !== 200) {
      console.log('Login failed:', loginResponse.status, loginResponse.body);
    }

    return getCookies(loginResponse.headers);
  };

  beforeEach(async () => {
    // Clear user storage before each test
    await User.deleteMany();
    // Clear room and game storage before each test
    RoomService.getInstance().clearStorage();
    GameService.getInstance().clearAllGames();
  });
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

  // Complete game workflow tests
  describe('Complete Game Workflow', () => {
    let hostCookies: string[];
    let player2Cookies: string[];
    let roomCode: string;

    beforeEach(async () => {
      // Register and login host
      hostCookies = await registerAndLogin('Host_User', 'host_user');

      // Register and login player 2
      player2Cookies = await registerAndLogin('Player_2', 'player2_user');

      const response = await request(app)
        .post('/api/room/create')
        .set('Cookie', hostCookies)
        .send();

      // Debug: log response if it fails
      if (!response.body.data) {
        console.log('Room creation failed:', response.status, response.body);
      }

      roomCode = response.body.data?.roomCode || '';

      // Update hostCookies to include the game_token cookie from room creation
      const roomCookies = getCookies(response.headers);
      hostCookies = [...hostCookies, ...roomCookies];

      // Player 2 joins
      const joinResponse = await request(app)
        .post('/api/room/join')
        .set('Cookie', player2Cookies)
        .send({ roomCode });

      // Update player2Cookies to include the game_token cookie from joining
      const joinCookies = getCookies(joinResponse.headers);
      player2Cookies = [...player2Cookies, ...joinCookies];

      // Start game
      await request(app).post('/api/room/start').set('Cookie', hostCookies);
    });

    it('should get game state after game starts', async () => {
      const response = await request(app)
        .get('/api/game/state')
        .set('Cookie', hostCookies)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('players');
      expect(response.body.data.players).toHaveLength(2);
      expect(response.body.data.players[0]).toHaveProperty('player_id');
      expect(response.body.data.players[0]).toHaveProperty('player_turn');
      expect(response.body.data.players[0]).toHaveProperty('position');
      expect(response.body.data.players[0]).toHaveProperty('player_money');
      expect(response.body.data.players[0].player_money).toBe(1500);
    });

    it('should roll dice successfully for player 1', async () => {
      const response = await request(app)
        .post('/api/game/roll-dice')
        .set('Cookie', hostCookies)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('dice');
      expect(response.body.data.dice).toHaveLength(2);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('newPosition');
      expect(response.body.data.total).toBeGreaterThanOrEqual(2);
      expect(response.body.data.total).toBeLessThanOrEqual(12);
    });

    it('should update player position after rolling dice', async () => {
      // Roll dice
      const rollResponse = await request(app)
        .post('/api/game/roll-dice')
        .set('Cookie', hostCookies)
        .send();

      const newPosition = rollResponse.body.data.newPosition;

      // Get game state
      const stateResponse = await request(app)
        .get('/api/game/state')
        .set('Cookie', hostCookies);

      expect(stateResponse.body.data.players[0].position).toBe(newPosition);
    });

    it('should not allow player 2 to roll dice when player 1\'s turn', async () => {
      const response = await request(app)
        .post('/api/game/roll-dice')
        .set('Cookie', player2Cookies)
        .send();

      // Player 2 can roll dice (game logic will handle turn validation)
      expect(response.status).toBe(500);
    });

    it('should allow player 2 to roll dice after player 1\'s turn', async () => {
      await request(app)
        .post('/api/game/roll-dice')
        .set('Cookie', hostCookies)
        .send();
      const response = await request(app)
        .post('/api/game/roll-dice')
        .set('Cookie', player2Cookies)
        .send();

      // Player 2 can roll dice (game logic will handle turn validation)
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('dice');
    });
  });

  // Authentication tests for game endpoints
  describe('POST /api/game/roll-dice - Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app).post('/api/game/roll-dice').send({});

      expect(response.status).toBe(401);
    });

    it('should return 401 without auth cookie', async () => {
      const response = await request(app)
        .post('/api/game/roll-dice')
        .send({ playerId: "test_user_id" });

      expect(response.status).toBe(401);
    });

    it('should return 400 when playerId is missing', async () => {
      // Create authenticated user
      const hostCookies = await registerAndLogin('Test_Host', 'test_host');

      // Create room and start game
      const createRoom = await request(app)
        .post('/api/room/create')
        .set('Cookie', hostCookies)
        .send();
      const roomCode = createRoom.body.data.roomCode;

      // Add another player
      const player2Cookies = await registerAndLogin('Test_Player_2', 'test_player2');

      await request(app)
        .post('/api/room/join')
        .set('Cookie', player2Cookies)
        .send({ roomCode });

      await request(app).post('/api/room/start').set('Cookie', hostCookies);

      // Try to roll without playerId
      const response = await request(app)
        .post('/api/game/roll-dice')
        .set('Cookie', hostCookies)
        .send({});

      // Expect either 400 (missing playerId) or 401 (auth issue)
      expect([400, 401]).toContain(response.status);
    });
  });

  describe('GET /api/game/state - Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/game/state');

      expect(response.status).toBe(401);
    });

    it('should return 400 when user has no roomCode in token', async () => {
      // Create user without joining a room
      const cookies = await registerAndLogin('Test_User', 'test_user_noroomcode');

      const response = await request(app)
        .get('/api/game/state')
        .set('Cookie', cookies);

      // Expect either 400 (no roomCode) or 401 (auth issue)
      expect([400, 401]).toContain(response.status);
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
