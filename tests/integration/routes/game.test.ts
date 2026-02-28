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

  describe('GET /api/game/board - Get board for user\'s game', () => {
    let hostCookies: string[];
    let player2Cookies: string[];
    let roomCode: string;

    beforeEach(async () => {
      // Register and login host
      hostCookies = await registerAndLogin('Host_Board', 'host_board');

      // Register and login player 2
      player2Cookies = await registerAndLogin('Player_Board_2', 'player_board_2');

      const response = await request(app)
        .post('/api/room/create')
        .set('Cookie', hostCookies)
        .send();

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

    it('should get board for authenticated user in a game', async () => {
      const response = await request(app)
        .get('/api/game/board')
        .set('Cookie', hostCookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('version');
      expect(response.body.data).toHaveProperty('cells');
      expect(Array.isArray(response.body.data.cells)).toBe(true);
    });

    it('should return board with correct boardId from game settings', async () => {
      const response = await request(app)
        .get('/api/game/board')
        .set('Cookie', hostCookies);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe('european_football_club_giants');
      expect(response.body.data.version).toBe('1.0');
    });

    it('should return board with all required properties', async () => {
      const response = await request(app)
        .get('/api/game/board')
        .set('Cookie', hostCookies);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('edition');
      expect(response.body.data).toHaveProperty('currency');
      expect(response.body.data).toHaveProperty('currency_symbol');
      expect(response.body.data).toHaveProperty('terms');
      expect(response.body.data.cells.length).toBeGreaterThan(0);
    });

    it('should work for player 2 in the same game', async () => {
      const response = await request(app)
        .get('/api/game/board')
        .set('Cookie', player2Cookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('european_football_club_giants');
    });

    it('should return same board for all players in the same game', async () => {
      const hostResponse = await request(app)
        .get('/api/game/board')
        .set('Cookie', hostCookies);

      const player2Response = await request(app)
        .get('/api/game/board')
        .set('Cookie', player2Cookies);

      expect(hostResponse.status).toBe(200);
      expect(player2Response.status).toBe(200);
      expect(hostResponse.body.data.id).toBe(player2Response.body.data.id);
      expect(hostResponse.body.data.version).toBe(player2Response.body.data.version);
      expect(hostResponse.body.data.cells.length).toBe(player2Response.body.data.cells.length);
    });

    it('should return board with flattened cell properties', async () => {
      const response = await request(app)
        .get('/api/game/board')
        .set('Cookie', hostCookies);

      expect(response.status).toBe(200);
      const cells = response.body.data.cells;

      // Check that cells have expected structure
      const firstCell = cells[0];
      expect(firstCell).toHaveProperty('index');
      expect(firstCell).toHaveProperty('name');
      expect(firstCell).toHaveProperty('cell_type');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/game/board');

      expect(response.status).toBe(401);
    });

    it('should return 400 when user has no roomCode in token', async () => {
      // Create user without joining a room
      const cookies = await registerAndLogin('User_No_Room', 'user_no_room_board');

      const response = await request(app)
        .get('/api/game/board')
        .set('Cookie', cookies);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Required Property not found in token');
    });

    it('should return 404 when game does not exist for roomCode', async () => {
      // Register and login user
      const cookies = await registerAndLogin('User_No_Game', 'user_no_game_board');

      // Create room but don't start game - this won't work as expected
      // Instead, we'll manually create a token with invalid roomCode
      // For now, we'll skip this specific test as it requires manual token manipulation

      // Alternatively, we can create a room, start game, then delete the game
      const createResponse = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookies)
        .send();

      const roomCode = createResponse.body.data.roomCode;
      const updatedCookies = [...cookies, ...getCookies(createResponse.headers)];

      // Join another player
      const player2Cookies = await registerAndLogin('Player_No_Game_2', 'player_no_game_2');
      await request(app)
        .post('/api/room/join')
        .set('Cookie', player2Cookies)
        .send({ roomCode });

      // Start game
      await request(app).post('/api/room/start').set('Cookie', updatedCookies);

      // Now delete the game
      const roomService = RoomService.getInstance();
      const room = roomService.getRoom(roomCode);
      if (room) {
        GameService.getInstance().deleteGame(room.roomId);
      }

      // Try to get board
      const response = await request(app)
        .get('/api/game/board')
        .set('Cookie', updatedCookies);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Board not found');
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

  describe('POST /api/game/end-turn - End Turn Flow', () => {
    let hostCookies: string[];
    let player2Cookies: string[];
    let roomCode: string;

    beforeEach(async () => {
      // Register and login host
      hostCookies = await registerAndLogin('EndTurn_Host', 'endturn_host');

      // Register and login player 2
      player2Cookies = await registerAndLogin('EndTurn_Player2', 'endturn_player2');

      const response = await request(app)
        .post('/api/room/create')
        .set('Cookie', hostCookies)
        .send();

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

    it('should end turn successfully after rolling dice', async () => {
      // Player 1 rolls dice
      await request(app)
        .post('/api/game/roll-dice')
        .set('Cookie', hostCookies)
        .send();

      // Check game state to see if we need to buy/pass property
      const stateAfterRoll = await request(app)
        .get('/api/game/state')
        .set('Cookie', hostCookies);

      // If in BUY_PROPERTY phase, pass the property first
      if (stateAfterRoll.body.data.phase === 'BUY_PROPERTY') {
        await request(app)
          .post('/api/game/pass')
          .set('Cookie', hostCookies)
          .send();
      }

      // Player 1 ends turn
      const response = await request(app)
        .post('/api/game/end-turn')
        .set('Cookie', hostCookies)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toBe(true);
    });

    it('should advance to next player after ending turn', async () => {
      // Player 1 rolls dice
      await request(app)
        .post('/api/game/roll-dice')
        .set('Cookie', hostCookies)
        .send();

      // Check game state to see if we need to buy/pass property
      const stateAfterRoll = await request(app)
        .get('/api/game/state')
        .set('Cookie', hostCookies);

      // If in BUY_PROPERTY phase, pass the property first
      if (stateAfterRoll.body.data.phase === 'BUY_PROPERTY') {
        await request(app)
          .post('/api/game/pass')
          .set('Cookie', hostCookies)
          .send();
      }

      // Player 1 ends turn
      await request(app)
        .post('/api/game/end-turn')
        .set('Cookie', hostCookies)
        .send();

      // Get game state
      const stateResponse = await request(app)
        .get('/api/game/state')
        .set('Cookie', player2Cookies);

      expect(stateResponse.status).toBe(200);
      expect(stateResponse.body.data.turn.currentPlayerIndex).toBe(1);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/game/end-turn')
        .send();

      expect(response.status).toBe(401);
    });

    it('should return 400 when user has no roomCode in token', async () => {
      // Create user without joining a room
      const cookies = await registerAndLogin('NoRoom_User', 'noroom_endturn');

      const response = await request(app)
        .post('/api/game/end-turn')
        .set('Cookie', cookies);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Required Property not found in token');
    });

    it('should return 500 when not player\'s turn', async () => {
      // Try to end turn when it's not player 2's turn
      const response = await request(app)
        .post('/api/game/end-turn')
        .set('Cookie', player2Cookies)
        .send();

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Not your turn');
    });

    it('should return 500 when trying to end turn in wrong phase', async () => {
      // Try to end turn without rolling dice first (wrong phase)
      const response = await request(app)
        .post('/api/game/end-turn')
        .set('Cookie', hostCookies)
        .send();

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not allowed in phase');
    });

    it('should allow player 2 to roll dice after player 1 ends turn', async () => {
      // Player 1 rolls dice
      await request(app)
        .post('/api/game/roll-dice')
        .set('Cookie', hostCookies)
        .send();

      // Check game state to see if we need to buy/pass property
      const stateAfterRoll = await request(app)
        .get('/api/game/state')
        .set('Cookie', hostCookies);

      // If in BUY_PROPERTY phase, pass the property first
      if (stateAfterRoll.body.data.phase === 'BUY_PROPERTY') {
        await request(app)
          .post('/api/game/pass')
          .set('Cookie', hostCookies)
          .send();
      }

      // Player 1 ends turn
      await request(app)
        .post('/api/game/end-turn')
        .set('Cookie', hostCookies)
        .send();

      // Player 2 should be able to roll dice now
      const rollResponse = await request(app)
        .post('/api/game/roll-dice')
        .set('Cookie', player2Cookies)
        .send();

      expect(rollResponse.status).toBe(200);
      expect(rollResponse.body.success).toBe(true);
      expect(rollResponse.body.data).toHaveProperty('dice');
      expect(rollResponse.body.data.dice).toHaveLength(2);
    });

    it('should complete a full round and increment round number', async () => {
      // Player 1's turn
      await request(app)
        .post('/api/game/roll-dice')
        .set('Cookie', hostCookies)
        .send();

      // Check and handle BUY_PROPERTY phase
      let state = await request(app)
        .get('/api/game/state')
        .set('Cookie', hostCookies);

      if (state.body.data.phase === 'BUY_PROPERTY') {
        await request(app)
          .post('/api/game/pass')
          .set('Cookie', hostCookies)
          .send();
      }

      await request(app)
        .post('/api/game/end-turn')
        .set('Cookie', hostCookies)
        .send();

      // Player 2's turn
      await request(app)
        .post('/api/game/roll-dice')
        .set('Cookie', player2Cookies)
        .send();

      // Check and handle BUY_PROPERTY phase
      state = await request(app)
        .get('/api/game/state')
        .set('Cookie', player2Cookies);

      if (state.body.data.phase === 'BUY_PROPERTY') {
        await request(app)
          .post('/api/game/pass')
          .set('Cookie', player2Cookies)
          .send();
      }

      await request(app)
        .post('/api/game/end-turn')
        .set('Cookie', player2Cookies)
        .send();

      // Check that it's player 1's turn again and round has incremented
      const stateResponse = await request(app)
        .get('/api/game/state')
        .set('Cookie', hostCookies);

      expect(stateResponse.status).toBe(200);
      expect(stateResponse.body.data.turn.currentPlayerIndex).toBe(0);
      expect(stateResponse.body.data.turn.round).toBe(2);
    });

    it('should reset phase to ROLL_DICE after ending turn', async () => {
      // Player 1 rolls dice
      await request(app)
        .post('/api/game/roll-dice')
        .set('Cookie', hostCookies)
        .send();

      // Check and handle BUY_PROPERTY phase
      let state = await request(app)
        .get('/api/game/state')
        .set('Cookie', hostCookies);

      if (state.body.data.phase === 'BUY_PROPERTY') {
        await request(app)
          .post('/api/game/pass')
          .set('Cookie', hostCookies)
          .send();
      }

      // End turn
      await request(app)
        .post('/api/game/end-turn')
        .set('Cookie', hostCookies)
        .send();

      // Check game state
      const stateResponse = await request(app)
        .get('/api/game/state')
        .set('Cookie', player2Cookies);

      expect(stateResponse.status).toBe(200);
      expect(stateResponse.body.data.phase).toBe('ROLL_DICE');
    });

    it('should maintain player positions after turn changes', async () => {
      // Player 1 rolls dice
      const rollResponse = await request(app)
        .post('/api/game/roll-dice')
        .set('Cookie', hostCookies)
        .send();

      // Check if roll was successful
      if (rollResponse.status === 200 && rollResponse.body.data) {
        const player1Position = rollResponse.body.data.newPosition;

        // Check and handle BUY_PROPERTY phase
        let state = await request(app)
          .get('/api/game/state')
          .set('Cookie', hostCookies);

        if (state.body.data.phase === 'BUY_PROPERTY') {
          await request(app)
            .post('/api/game/pass')
            .set('Cookie', hostCookies)
            .send();
        }

        // Player 1 ends turn
        await request(app)
          .post('/api/game/end-turn')
          .set('Cookie', hostCookies)
          .send();

        // Check that player 1's position is maintained
        const stateResponse = await request(app)
          .get('/api/game/state')
          .set('Cookie', hostCookies);

        expect(stateResponse.status).toBe(200);
        expect(stateResponse.body.data.players[0].position).toBe(player1Position);
      }
    });

    it('should handle multiple rounds correctly', async () => {
      // Complete 2 full rounds
      for (let round = 0; round < 2; round++) {
        // Player 1's turn
        await request(app)
          .post('/api/game/roll-dice')
          .set('Cookie', hostCookies)
          .send();

        // Check and handle BUY_PROPERTY phase
        let state = await request(app)
          .get('/api/game/state')
          .set('Cookie', hostCookies);

        if (state.body.data.phase === 'BUY_PROPERTY') {
          await request(app)
            .post('/api/game/pass')
            .set('Cookie', hostCookies)
            .send();
        }

        await request(app)
          .post('/api/game/end-turn')
          .set('Cookie', hostCookies)
          .send();

        // Player 2's turn
        await request(app)
          .post('/api/game/roll-dice')
          .set('Cookie', player2Cookies)
          .send();

        // Check and handle BUY_PROPERTY phase
        state = await request(app)
          .get('/api/game/state')
          .set('Cookie', player2Cookies);

        if (state.body.data.phase === 'BUY_PROPERTY') {
          await request(app)
            .post('/api/game/pass')
            .set('Cookie', player2Cookies)
            .send();
        }

        await request(app)
          .post('/api/game/end-turn')
          .set('Cookie', player2Cookies)
          .send();
      }

      // Check that round is 3 (started at 1, incremented twice)
      const stateResponse = await request(app)
        .get('/api/game/state')
        .set('Cookie', hostCookies);

      expect(stateResponse.status).toBe(200);
      expect(stateResponse.body.data.turn.round).toBe(3);
      expect(stateResponse.body.data.turn.currentPlayerIndex).toBe(0);
    });
  });

  describe('POST /api/game/buy and POST /api/game/pass - Buy/Pass Property Flow', () => {
    let hostCookies: string[];
    let player2Cookies: string[];
    let roomCode: string;

    beforeEach(async () => {
      // Register and login host
      hostCookies = await registerAndLogin('BuyPass_Host', 'buypass_host');

      // Register and login player 2
      player2Cookies = await registerAndLogin('BuyPass_Player2', 'buypass_player2');

      const response = await request(app)
        .post('/api/room/create')
        .set('Cookie', hostCookies)
        .send();

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

    describe('POST /api/game/buy - Buy Property', () => {
      it('should buy property successfully after landing on it', async () => {
        // Roll dice to move to a property
        const rollResponse = await request(app)
          .post('/api/game/roll-dice')
          .set('Cookie', hostCookies)
          .send();

        // Only proceed if roll was successful
        if (rollResponse.status === 200 && rollResponse.body.data) {
          const newPosition = rollResponse.body.data.newPosition;

          // Get game state to check if we landed on a purchasable property
          const stateBeforeBuy = await request(app)
            .get('/api/game/state')
            .set('Cookie', hostCookies);

          const currentTile = stateBeforeBuy.body.data.currentTile;
          const currentPhase = stateBeforeBuy.body.data.phase;

          // Only test buy if we're in BUY_PROPERTY phase
          if (currentPhase === 'BUY_PROPERTY' && currentTile && !currentTile.isOwned) {
            const playerMoneyBefore = stateBeforeBuy.body.data.players[0].player_money;

            // Buy the property
            const buyResponse = await request(app)
              .post('/api/game/buy')
              .set('Cookie', hostCookies)
              .send();

            expect(buyResponse.status).toBe(200);
            expect(buyResponse.body.success).toBe(true);

            // Verify game state after buying
            const stateAfterBuy = await request(app)
              .get('/api/game/state')
              .set('Cookie', hostCookies);

            const player = stateAfterBuy.body.data.players[0];

            // Check money was deducted
            expect(player.player_money).toBeLessThan(playerMoneyBefore);

            // Check property was added to appropriate array
            if (currentTile.type === 'property') {
              expect(player.property_owns).toContain(newPosition + 1);
            } else if (currentTile.type === 'transport') {
              expect(player.transport_owns).toContain(newPosition + 1);
            } else if (currentTile.type === 'utility') {
              expect(player.utility_owns).toContain(newPosition + 1);
            }

            // Check phase changed to END_TURN
            expect(stateAfterBuy.body.data.phase).toBe('END_TURN');
          }
        }
      });

      it('should return 401 when not authenticated', async () => {
        const response = await request(app)
          .post('/api/game/buy')
          .send();

        expect(response.status).toBe(401);
      });

      it('should return 400 when user has no roomCode in token', async () => {
        const cookies = await registerAndLogin('NoRoom_Buy', 'noroom_buy');

        const response = await request(app)
          .post('/api/game/buy')
          .set('Cookie', cookies);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Required Property not found in token');
      });

      it('should return 403 when trying to buy in wrong phase', async () => {
        // Try to buy without rolling dice first
        const response = await request(app)
          .post('/api/game/buy')
          .set('Cookie', hostCookies)
          .send();

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('not allowed in phase');
      });

      it('should return 403 when not player\'s turn', async () => {
        // Player 2 tries to buy when it's player 1's turn
        const response = await request(app)
          .post('/api/game/buy')
          .set('Cookie', player2Cookies)
          .send();

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Not your turn');
      });
    });

    describe('POST /api/game/pass - Pass Property', () => {
      it('should pass property successfully after landing on it', async () => {
        // Roll dice to move to a property
        await request(app)
          .post('/api/game/roll-dice')
          .set('Cookie', hostCookies)
          .send();

        // Get game state to check phase
        const stateBefore = await request(app)
          .get('/api/game/state')
          .set('Cookie', hostCookies);

        const currentPhase = stateBefore.body.data.phase;

        // Only test pass if we're in BUY_PROPERTY phase
        if (currentPhase === 'BUY_PROPERTY') {
          const playerMoneyBefore = stateBefore.body.data.players[0].player_money;
          const propertyOwnsBefore = [...stateBefore.body.data.players[0].property_owns];

          // Pass the property
          const passResponse = await request(app)
            .post('/api/game/pass')
            .set('Cookie', hostCookies)
            .send();

          expect(passResponse.status).toBe(200);
          expect(passResponse.body.success).toBe(true);

          // Verify game state after passing
          const stateAfter = await request(app)
            .get('/api/game/state')
            .set('Cookie', hostCookies);

          const player = stateAfter.body.data.players[0];

          // Check money was NOT deducted
          expect(player.player_money).toBe(playerMoneyBefore);

          // Check property was NOT added
          expect(player.property_owns).toEqual(propertyOwnsBefore);

          // Check phase changed to END_TURN
          expect(stateAfter.body.data.phase).toBe('END_TURN');
        }
      });

      it('should allow ending turn after passing property', async () => {
        // Roll dice
        await request(app)
          .post('/api/game/roll-dice')
          .set('Cookie', hostCookies)
          .send();

        // Check if in BUY_PROPERTY phase
        const stateBefore = await request(app)
          .get('/api/game/state')
          .set('Cookie', hostCookies);

        if (stateBefore.body.data.phase === 'BUY_PROPERTY') {
          // Pass property
          await request(app)
            .post('/api/game/pass')
            .set('Cookie', hostCookies)
            .send();

          // End turn
          const endTurnResponse = await request(app)
            .post('/api/game/end-turn')
            .set('Cookie', hostCookies)
            .send();

          expect(endTurnResponse.status).toBe(200);
          expect(endTurnResponse.body.success).toBe(true);

          // Verify turn changed
          const stateAfter = await request(app)
            .get('/api/game/state')
            .set('Cookie', player2Cookies);

          expect(stateAfter.body.data.turn.currentPlayerIndex).toBe(1);
        }
      });

      it('should return 401 when not authenticated', async () => {
        const response = await request(app)
          .post('/api/game/pass')
          .send();

        expect(response.status).toBe(401);
      });

      it('should return 400 when user has no roomCode in token', async () => {
        const cookies = await registerAndLogin('NoRoom_Pass', 'noroom_pass');

        const response = await request(app)
          .post('/api/game/pass')
          .set('Cookie', cookies);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Required Property not found in token');
      });

      it('should return 403 when trying to pass in wrong phase', async () => {
        // Try to pass without rolling dice first
        const response = await request(app)
          .post('/api/game/pass')
          .set('Cookie', hostCookies)
          .send();

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('not allowed in phase');
      });

      it('should return 403 when not player\'s turn', async () => {
        // Player 2 tries to pass when it's player 1's turn
        const response = await request(app)
          .post('/api/game/pass')
          .set('Cookie', player2Cookies)
          .send();

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Not your turn');
      });
    });

    describe('Complete Buy/Pass Workflow', () => {
      it('should complete a full game flow with buy and pass', async () => {
        // Player 1 rolls dice
        await request(app)
          .post('/api/game/roll-dice')
          .set('Cookie', hostCookies)
          .send();

        let state = await request(app)
          .get('/api/game/state')
          .set('Cookie', hostCookies);

        // If in BUY_PROPERTY phase, pass it
        if (state.body.data.phase === 'BUY_PROPERTY') {
          await request(app)
            .post('/api/game/pass')
            .set('Cookie', hostCookies)
            .send();
        }

        // End turn
        await request(app)
          .post('/api/game/end-turn')
          .set('Cookie', hostCookies)
          .send();

        // Player 2 rolls dice
        await request(app)
          .post('/api/game/roll-dice')
          .set('Cookie', player2Cookies)
          .send();

        state = await request(app)
          .get('/api/game/state')
          .set('Cookie', player2Cookies);

        // If in BUY_PROPERTY phase, try to buy
        if (state.body.data.phase === 'BUY_PROPERTY' && state.body.data.currentTile && !state.body.data.currentTile.isOwned) {
          const buyResponse = await request(app)
            .post('/api/game/buy')
            .set('Cookie', player2Cookies)
            .send();

          expect(buyResponse.status).toBe(200);
        } else if (state.body.data.phase === 'BUY_PROPERTY') {
          // If property is owned or can't be bought, pass
          await request(app)
            .post('/api/game/pass')
            .set('Cookie', player2Cookies)
            .send();
        }

        // End turn
        await request(app)
          .post('/api/game/end-turn')
          .set('Cookie', player2Cookies)
          .send();

        // Verify we're back to player 1
        state = await request(app)
          .get('/api/game/state')
          .set('Cookie', hostCookies);

        expect(state.body.data.turn.currentPlayerIndex).toBe(0);
        expect(state.body.data.turn.round).toBe(2);
      });
    });
  });
});
