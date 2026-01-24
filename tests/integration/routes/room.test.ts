import request from 'supertest';
import app from '../../../src/server';
import { User } from '../../../src/models/User';
import { RoomService } from '../../../src/services/roomService';
import { GAME_CONSTANTS } from '../../../src/config/gameConstants';

describe('Room Routes', () => {
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
    await request(app)
      .post('/api/auth/register')
      .send({ username, userId, password });

    // Login and get cookie
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ userId, password });

    return getCookies(loginResponse.headers);
  };

  beforeEach(async () => {
    // Clear user storage before each test
    jest.replaceProperty(GAME_CONSTANTS, 'MAX_PLAYERS', 4);
    await User.deleteMany();
    // Clear room storage before each test
    RoomService.getInstance().clearStorage();
  });

  describe('POST /api/room/create', () => {
    it('should create a room successfully with valid authentication', async () => {
      const cookies = await registerAndLogin('testUser', 'testuser123');

      const response = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookies)
        .send();

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Room created successfully');
      expect(response.body.data).toHaveProperty('roomCode');
      expect(typeof response.body.data.roomCode).toBe('string');
      expect(response.body.data.roomCode).toHaveLength(6);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/room/create')
        .send();

      expect(response.status).toBe(401);
    });

    it('should update auth token with roomId', async () => {
      const cookies = await registerAndLogin('testUser', 'testuser123');

      const response = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookies)
        .send();

      expect(response.status).toBe(201);
      expect(response.headers['set-cookie']).toBeDefined();

      // The cookie should be updated with roomId
      const updatedCookies = response.headers['set-cookie'];
      expect(updatedCookies).toBeDefined();
    });

    it('should create multiple different rooms for different users', async () => {
      const cookies1 = await registerAndLogin('user1', 'userid1');
      const cookies2 = await registerAndLogin('user2', 'userid2');

      const response1 = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookies1)
        .send();

      const response2 = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookies2)
        .send();

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response1.body.data.roomCode).not.toBe(response2.body.data.roomCode);
    });

    it('should add creator as first player in the room', async () => {
      const cookies = await registerAndLogin('creator', 'creator123');

      const createResponse = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookies)
        .send();

      expect(createResponse.status).toBe(201);

      // Get updated cookie with roomId
      const newCookies = getCookies(createResponse.headers);

      // Check room status
      const statusResponse = await request(app)
        .get('/api/room/status')
        .set('Cookie', [...cookies, ...newCookies])
        .send();

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.data.players).toContain('creator123');
      expect(statusResponse.body.data.players.length).toBe(1);
    });
  });

  describe('GET /api/room/status', () => {
    it('should return room status when user is in a room', async () => {
      const cookies = await registerAndLogin('testUser', 'testuser123');

      // Create a room first
      const createResponse = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookies)
        .send();

      const newCookies = getCookies(createResponse.headers);

      // Get room status
      const response = await request(app)
        .get('/api/room/status')
        .set('Cookie', [...cookies, ...newCookies])
        .send();

      const status = response.body.data;
      expect(response.status).toBe(200);
      expect(status).toHaveProperty('roomId');
      expect(status).toHaveProperty('roomCode');
      expect(status).toHaveProperty('players');
      expect(Array.isArray(status.players)).toBe(true);
      expect(status.players).toContain('testuser123');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/room/status')
        .send();

      expect(response.status).toBe(401);
    });

    it('should return 400 when user has no roomId in token', async () => {
      const cookies = await registerAndLogin('testUser', 'testuser123');

      // Try to get status without creating a room
      const response = await request(app)
        .get('/api/room/status')
        .set('Cookie', cookies)
        .send();

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Required Property not found in token');
    });

    it('should return correct room information', async () => {
      const cookies = await registerAndLogin('player1', 'player1id');

      // Create room
      const createResponse = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookies)
        .send();

      const roomCode = createResponse.body.data.roomCode;
      const newCookies = getCookies(createResponse.headers);

      // Get status
      const statusResponse = await request(app)
        .get('/api/room/status')
        .set('Cookie', [...cookies, ...newCookies])
        .send();

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.data.roomCode).toBe(roomCode);
      expect(statusResponse.body.data.players).toEqual(['player1id']);
    });

    it('should show room with correct structure', async () => {
      const cookies = await registerAndLogin('testUser', 'testuser123');

      const createResponse = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookies)
        .send();

      const newCookies = getCookies(createResponse.headers);

      const response = await request(app)
        .get('/api/room/status')
        .set('Cookie', [...cookies, ...newCookies])
        .send();

      expect(response.status).toBe(200);
      expect(typeof response.body.data.roomId).toBe('string');
      expect(typeof response.body.data.roomCode).toBe('string');
      expect(response.body.data.roomCode).toHaveLength(6);
      expect(Array.isArray(response.body.data.players)).toBe(true);
    });
  });

  describe('POST /api/room/join', () => {
    it('should allow a user to join an existing room successfully', async () => {
      // Create a room with user1
      const cookies1 = await registerAndLogin('user1', 'user1id');
      const createResponse = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookies1)
        .send();

      expect(createResponse.status).toBe(201);
      const roomCode = createResponse.body.data.roomCode;

      // Register and login user2
      const cookies2 = await registerAndLogin('user2', 'user2id');

      // User2 joins the room by sending roomCode in body
      const joinResponse = await request(app)
        .post('/api/room/join')
        .set('Cookie', cookies2)
        .send({ roomCode });

      expect(joinResponse.status).toBe(200);
      expect(joinResponse.body).toHaveProperty('success', true);
      expect(joinResponse.body).toHaveProperty('message', 'Joined room successfully');
    });

    it('should add the joining user to the room player list', async () => {
      // Create a room with user1
      const cookies1 = await registerAndLogin('creator', 'creatorid');
      const createResponse = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookies1)
        .send();

      const roomCode = createResponse.body.data.roomCode;
      const creatorNewCookies = getCookies(createResponse.headers);

      // Register and login joiner
      const cookiesJoiner = await registerAndLogin('joiner', 'joinerid');

      // Joiner joins the room
      const joinResponse = await request(app)
        .post('/api/room/join')
        .set('Cookie', cookiesJoiner)
        .send({ roomCode });

      expect(joinResponse.status).toBe(200);

      // Check room status from creator's perspective
      const statusResponse = await request(app)
        .get('/api/room/status')
        .set('Cookie', [...cookies1, ...creatorNewCookies])
        .send();

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.data.players).toContain('creatorid');
      expect(statusResponse.body.data.players).toContain('joinerid');
      expect(statusResponse.body.data.players.length).toBe(2);
    });

    it('should update the joiner\'s auth token with roomCode', async () => {
      // Create a room
      const cookiesCreator = await registerAndLogin('creator', 'creatorid');
      const createResponse = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookiesCreator)
        .send();

      const roomCode = createResponse.body.data.roomCode;

      // Register joiner
      const cookiesJoiner = await registerAndLogin('joiner', 'joinerid');

      // Join the room
      const joinResponse = await request(app)
        .post('/api/room/join')
        .set('Cookie', cookiesJoiner)
        .send({ roomCode });

      expect(joinResponse.status).toBe(200);
      expect(joinResponse.headers['set-cookie']).toBeDefined();

      // Use updated cookie to check room status
      const newCookies = getCookies(joinResponse.headers);
      const statusResponse = await request(app)
        .get('/api/room/status')
        .set('Cookie', [...cookiesJoiner, ...newCookies])
        .send();

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.data.roomCode).toBe(roomCode);
      expect(statusResponse.body.data.players).toContain('joinerid');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/room/join')
        .send({ roomCode: '123456' });

      expect(response.status).toBe(401);
    });

    it('should return 400 when roomCode is not provided in body', async () => {
      const cookies = await registerAndLogin('testUser', 'testuser123');

      // Try to join without roomCode in body
      const response = await request(app)
        .post('/api/room/join')
        .set('Cookie', cookies)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found in request');
    });

    it('should return 400 when trying to join non-existent room', async () => {
      const cookies = await registerAndLogin('testUser', 'testuser123');

      const response = await request(app)
        .post('/api/room/join')
        .set('Cookie', cookies)
        .send({ roomCode: '999999' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Failed to join room');
    });

    it('should allow multiple users to join the same room', async () => {
      // Create a room with host
      const cookiesHost = await registerAndLogin('host', 'hostid');
      const createResponse = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookiesHost)
        .send();

      const roomCode = createResponse.body.data.roomCode;
      const hostCookiesUpdated = getCookies(createResponse.headers);

      // Register players
      const cookiesPlayer1 = await registerAndLogin('player1', 'player1id');
      const cookiesPlayer2 = await registerAndLogin('player2', 'player2id');
      const cookiesPlayer3 = await registerAndLogin('player3', 'player3id');

      // Players join
      await request(app)
        .post('/api/room/join')
        .set('Cookie', cookiesPlayer1)
        .send({ roomCode });

      await request(app)
        .post('/api/room/join')
        .set('Cookie', cookiesPlayer2)
        .send({ roomCode });

      await request(app)
        .post('/api/room/join')
        .set('Cookie', cookiesPlayer3)
        .send({ roomCode });

      // Check room status
      const statusResponse = await request(app)
        .get('/api/room/status')
        .set('Cookie', [...cookiesHost, ...hostCookiesUpdated])
        .send();

      const status = statusResponse.body.data;
      expect(statusResponse.status).toBe(200);
      expect(status.players).toContain('hostid');
      expect(status.players).toContain('player1id');
      expect(status.players).toContain('player2id');
      expect(status.players).toContain('player3id');
      expect(status.players.length).toBe(4);
    });

    it('should return success false when trying to join same room twice', async () => {
      // Create a room with user1
      const cookies1 = await registerAndLogin('user1', 'user1id');
      const createResponse = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookies1)
        .send();

      const roomCode = createResponse.body.roomCode;
      const newCookie = getCookies(createResponse.headers);

      // User1 tries to join their own room again
      const joinResponse = await request(app)
        .post('/api/room/join')
        .set('Cookie', [...cookies1, ...newCookie])
        .send({ roomCode });

      // Should return success false since user is already in the room
      expect(joinResponse.status).toBe(400);
      expect(joinResponse.body).toHaveProperty('success', false);
    });

    it('should return 400 with invalid roomCode format', async () => {
      const cookies = await registerAndLogin('testUser', 'testuser123');

      const response = await request(app)
        .post('/api/room/join')
        .set('Cookie', cookies)
        .send({ roomCode: 'invalid' });

      expect(response.status).toBe(400);
    });
  });

  describe('Room workflow', () => {
    it('should support complete create and status workflow', async () => {
      const cookies = await registerAndLogin('fullWorkflowUser', 'workflow123');

      // Step 1: Create room
      const createResponse = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookies)
        .send();

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.data).toHaveProperty('roomCode');

      const roomCode = createResponse.body.data.roomCode;
      const updatedCookies = getCookies(createResponse.headers);

      // Step 2: Check status
      const statusResponse = await request(app)
        .get('/api/room/status')
        .set('Cookie', [...cookies, ...updatedCookies])
        .send();

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.data.roomCode).toBe(roomCode);
      expect(statusResponse.body.data.players).toContain('workflow123');
    });

    it('should maintain separate rooms for different users', async () => {
      const cookiesA = await registerAndLogin('userA', 'userAid');
      const cookiesB = await registerAndLogin('userB', 'userBid');

      // Create room A
      const createA = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookiesA)
        .send();

      // Create room B
      const createB = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookiesB)
        .send();

      expect(createA.body.data.roomCode).not.toBe(createB.body.data.roomCode);

      const newCookieA = getCookies(createA.headers);
      // Check status A
      const statusA = await request(app)
        .get('/api/room/status')
        .set('Cookie', [...cookiesA, ...newCookieA])
        .send();

      const newCookieB = getCookies(createB.headers);
      // Check status B
      const statusB = await request(app)
        .get('/api/room/status')
        .set('Cookie', [...cookiesB, ...newCookieB])
        .send();

      const statusOfA = statusA.body.data;
      const statusOfB = statusB.body.data;
      expect(statusOfA.players).toEqual(['userAid']);
      expect(statusOfB.players).toEqual(['userBid']);
      expect(statusOfA.roomId).not.toBe(statusOfB.roomId);
      expect(statusOfA.roomCode).not.toBe(statusOfB.roomCode);
    });
  });

  describe('POST /api/room/start', () => {
    it('should start the game successfully when host has minimum players', async () => {
      // Create a room with host
      const cookiesHost = await registerAndLogin('host', 'hostid');
      const createResponse = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookiesHost)
        .send();

      const roomCode = createResponse.body.data.roomCode;
      const hostCookiesUpdated = getCookies(createResponse.headers);

      // Add another player to meet minimum requirement
      const cookiesPlayer = await registerAndLogin('player1', 'player1id');
      await request(app)
        .post('/api/room/join')
        .set('Cookie', cookiesPlayer)
        .send({ roomCode });

      // Host starts the game
      const startResponse = await request(app)
        .post('/api/room/start')
        .set('Cookie', [...cookiesHost, ...hostCookiesUpdated])
        .send();

      expect(startResponse.status).toBe(200);
      expect(startResponse.body).toHaveProperty('success', true);
      expect(startResponse.body).toHaveProperty('message', 'Game started successfully');
    });

    it('should return 400 when user has no roomCode in token', async () => {
      const cookies = await registerAndLogin('testUser', 'testuser123');

      // Try to start without being in a room
      const response = await request(app)
        .post('/api/room/start')
        .set('Cookie', cookies)
        .send();

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Required Property not found in token');
    });

    it('should return 404 when room does not exist', async () => {
      // Create a room
      const cookies = await registerAndLogin('host', 'hostid');
      const createResponse = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookies)
        .send();

      const hostCookiesUpdated = getCookies(createResponse.headers);

      // Clear room storage to simulate non-existent room
      RoomService.getInstance().clearStorage();

      // Try to start the game
      const startResponse = await request(app)
        .post('/api/room/start')
        .set('Cookie', [...cookies, ...hostCookiesUpdated])
        .send();

      expect(startResponse.status).toBe(404);
      expect(startResponse.body.success).toBe(false);
      expect(startResponse.body.message).toContain('not found');
    });

    it('should return 403 when non-host tries to start the game', async () => {
      // Create a room with host
      const cookiesHost = await registerAndLogin('host', 'hostid');
      const createResponse = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookiesHost)
        .send();

      const roomCode = createResponse.body.data.roomCode;

      // Add another player
      const cookiesPlayer = await registerAndLogin('player1', 'player1id');
      const joinResponse = await request(app)
        .post('/api/room/join')
        .set('Cookie', cookiesPlayer)
        .send({ roomCode });

      const playerCookiesUpdated = getCookies(joinResponse.headers);

      // Non-host player tries to start the game
      const startResponse = await request(app)
        .post('/api/room/start')
        .set('Cookie', [...cookiesPlayer, ...playerCookiesUpdated])
        .send();

      expect(startResponse.status).toBe(403);
      expect(startResponse.body.success).toBe(false);
      expect(startResponse.body.message).toContain('host');
    });

    it('should return 400 when there are not enough players', async () => {
      // Create a room with only host
      const cookiesHost = await registerAndLogin('host', 'hostid');
      const createResponse = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookiesHost)
        .send();

      const hostCookiesUpdated = getCookies(createResponse.headers);

      // Try to start with only 1 player (minimum is 2)
      const startResponse = await request(app)
        .post('/api/room/start')
        .set('Cookie', [...cookiesHost, ...hostCookiesUpdated])
        .send();

      expect(startResponse.status).toBe(400);
      expect(startResponse.body.success).toBe(false);
      expect(startResponse.body.message).toContain('players');
    });

    it('should return 400 when game is already started', async () => {
      // Create a room with host
      const cookiesHost = await registerAndLogin('host', 'hostid');
      const createResponse = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookiesHost)
        .send();

      const roomCode = createResponse.body.data.roomCode;
      const hostCookiesUpdated = getCookies(createResponse.headers);

      // Add another player
      const cookiesPlayer = await registerAndLogin('player1', 'player1id');
      await request(app)
        .post('/api/room/join')
        .set('Cookie', cookiesPlayer)
        .send({ roomCode });

      // Start the game first time
      const firstStart = await request(app)
        .post('/api/room/start')
        .set('Cookie', [...cookiesHost, ...hostCookiesUpdated])
        .send();

      expect(firstStart.status).toBe(200);

      // Try to start the game again
      const secondStart = await request(app)
        .post('/api/room/start')
        .set('Cookie', [...cookiesHost, ...hostCookiesUpdated])
        .send();

      expect(secondStart.status).toBe(400);
      expect(secondStart.body.success).toBe(false);
      expect(secondStart.body.message).toContain('already started');
    });

    it('should successfully start game with exactly minimum players', async () => {
      // Create a room with host
      const cookiesHost = await registerAndLogin('host', 'hostid');
      const createResponse = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookiesHost)
        .send();

      const roomCode = createResponse.body.data.roomCode;
      const hostCookiesUpdated = getCookies(createResponse.headers);

      // Add exactly 1 more player to reach minimum (2 players)
      const cookiesPlayer = await registerAndLogin('player1', 'player1id');
      await request(app)
        .post('/api/room/join')
        .set('Cookie', cookiesPlayer)
        .send({ roomCode });

      // Start the game
      const startResponse = await request(app)
        .post('/api/room/start')
        .set('Cookie', [...cookiesHost, ...hostCookiesUpdated])
        .send();

      expect(startResponse.status).toBe(200);
      expect(startResponse.body.success).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid routes under /api/room', async () => {
      const response = await request(app)
        .get('/api/room/invalid')
        .send();

      expect(response.status).toBe(404);
    });

    it('should require authentication for all room endpoints', async () => {
      const createResponse = await request(app)
        .post('/api/room/create')
        .send();

      const statusResponse = await request(app)
        .get('/api/room/status')
        .send();

      const joinResponse = await request(app)
        .post('/api/room/join')
        .send();

      const startResponse = await request(app)
        .post('/api/room/start')
        .send();

      expect(createResponse.status).toBe(401);
      expect(statusResponse.status).toBe(401);
      expect(joinResponse.status).toBe(401);
      expect(startResponse.status).toBe(401);
    });
  });
});

