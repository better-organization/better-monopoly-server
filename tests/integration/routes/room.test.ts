import request from 'supertest';
import app from '../../../src/server';
import { User } from '../../../src/models/User';
import { RoomService } from '../../../src/services/roomService';

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
      expect(response.body).toHaveProperty('message', 'Room created successfully');
      expect(response.body).toHaveProperty('roomCode');
      expect(typeof response.body.roomCode).toBe('string');
      expect(response.body.roomCode).toHaveLength(6);
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
      expect(response1.body.roomCode).not.toBe(response2.body.roomCode);
    });

    it('should add creator as first player in the room', async () => {
      const cookies = await registerAndLogin('creator', 'creator123');

      const createResponse = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookies)
        .send();

      expect(createResponse.status).toBe(201);

      // Get updated cookie with roomId
      const updatedCookies = getCookies(createResponse.headers);

      // Check room status
      const statusResponse = await request(app)
        .get('/api/room/status')
        .set('Cookie', updatedCookies)
        .send();

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.players).toContain('creator');
      expect(statusResponse.body.players.length).toBe(1);
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

      const updatedCookies = getCookies(createResponse.headers);

      // Get room status
      const response = await request(app)
        .get('/api/room/status')
        .set('Cookie', updatedCookies)
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('roomId');
      expect(response.body).toHaveProperty('roomCode');
      expect(response.body).toHaveProperty('players');
      expect(Array.isArray(response.body.players)).toBe(true);
      expect(response.body.players).toContain('testUser');
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
      expect(response.body.message).toBe('roomCode not found in authentication token');
    });

    it('should return correct room information', async () => {
      const cookies = await registerAndLogin('player1', 'player1id');

      // Create room
      const createResponse = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookies)
        .send();

      const roomCode = createResponse.body.roomCode;
      const updatedCookies = getCookies(createResponse.headers);

      // Get status
      const statusResponse = await request(app)
        .get('/api/room/status')
        .set('Cookie', updatedCookies)
        .send();

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.roomCode).toBe(roomCode);
      expect(statusResponse.body.players).toEqual(['player1']);
    });

    it('should show room with correct structure', async () => {
      const cookies = await registerAndLogin('testUser', 'testuser123');

      const createResponse = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookies)
        .send();

      const updatedCookies = getCookies(createResponse.headers);

      const response = await request(app)
        .get('/api/room/status')
        .set('Cookie', updatedCookies)
        .send();

      expect(response.status).toBe(200);
      expect(typeof response.body.roomId).toBe('string');
      expect(typeof response.body.roomCode).toBe('string');
      expect(response.body.roomCode).toHaveLength(6);
      expect(Array.isArray(response.body.players)).toBe(true);
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
      const roomCode = createResponse.body.roomCode;

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

      const roomCode = createResponse.body.roomCode;
      const creatorCookiesUpdated = getCookies(createResponse.headers);

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
        .set('Cookie', creatorCookiesUpdated)
        .send();

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.players).toContain('creator');
      expect(statusResponse.body.players).toContain('joiner');
      expect(statusResponse.body.players.length).toBe(2);
    });

    it('should update the joiner\'s auth token with roomCode', async () => {
      // Create a room
      const cookiesCreator = await registerAndLogin('creator', 'creatorid');
      const createResponse = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookiesCreator)
        .send();

      const roomCode = createResponse.body.roomCode;

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
      const updatedCookies = getCookies(joinResponse.headers);
      const statusResponse = await request(app)
        .get('/api/room/status')
        .set('Cookie', updatedCookies)
        .send();

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.roomCode).toBe(roomCode);
      expect(statusResponse.body.players).toContain('joiner');
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
      expect(response.body.message).toBe('roomCode not found in request');
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

      const roomCode = createResponse.body.roomCode;
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
        .set('Cookie', hostCookiesUpdated)
        .send();

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.players).toContain('host');
      expect(statusResponse.body.players).toContain('player1');
      expect(statusResponse.body.players).toContain('player2');
      expect(statusResponse.body.players).toContain('player3');
      expect(statusResponse.body.players.length).toBe(4);
    });

    it('should return success false when trying to join same room twice', async () => {
      // Create a room with user1
      const cookies1 = await registerAndLogin('user1', 'user1id');
      const createResponse = await request(app)
        .post('/api/room/create')
        .set('Cookie', cookies1)
        .send();

      const roomCode = createResponse.body.roomCode;
      const updatedCookies1 = getCookies(createResponse.headers);

      // User1 tries to join their own room again
      const joinResponse = await request(app)
        .post('/api/room/join')
        .set('Cookie', updatedCookies1)
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
      expect(createResponse.body).toHaveProperty('roomCode');

      const roomCode = createResponse.body.roomCode;
      const updatedCookies = getCookies(createResponse.headers);

      // Step 2: Check status
      const statusResponse = await request(app)
        .get('/api/room/status')
        .set('Cookie', updatedCookies)
        .send();

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.roomCode).toBe(roomCode);
      expect(statusResponse.body.players).toContain('fullWorkflowUser');
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

      expect(createA.body.roomCode).not.toBe(createB.body.roomCode);

      // Check status A
      const statusA = await request(app)
        .get('/api/room/status')
        .set('Cookie', getCookies(createA.headers))
        .send();

      // Check status B
      const statusB = await request(app)
        .get('/api/room/status')
        .set('Cookie', getCookies(createB.headers))
        .send();

      expect(statusA.body.players).toEqual(['userA']);
      expect(statusB.body.players).toEqual(['userB']);
      expect(statusA.body.roomId).not.toBe(statusB.body.roomId);
      expect(statusA.body.roomCode).not.toBe(statusB.body.roomCode);
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

      expect(createResponse.status).toBe(401);
      expect(statusResponse.status).toBe(401);
      expect(joinResponse.status).toBe(401);
    });
  });
});

