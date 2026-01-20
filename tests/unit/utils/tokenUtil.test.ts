import { tokenUtil, IAuthTokenPayload, IGameTokenPayload } from '../../../src/utils/TokenUtil';
import jwt from 'jsonwebtoken';

describe('Token Model', () => {
  const JWT_SECRET = process.env['JWT_SECRET'] || 'a-string-secret-at-least-256-bits-long';
  const testUserId = 'user-123';
  const testUsername = 'testUser';

  describe('generateAuthToken', () => {
    it('should generate a valid JWT token', () => {
      const token = tokenUtil.generateAuthToken(testUserId, testUsername);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate token with correct payload', () => {
      const token = tokenUtil.generateAuthToken(testUserId, testUsername);
      const decoded = jwt.verify(token, JWT_SECRET) as IAuthTokenPayload;

      expect(decoded.userId).toBe(testUserId);
      expect(decoded.username).toBe(testUsername);
    });

    it('should generate different tokens for different users', () => {
      const token1 = tokenUtil.generateAuthToken('user1', 'username1');
      const token2 = tokenUtil.generateAuthToken('user2', 'username2');

      expect(token1).not.toBe(token2);

      const decoded1 = jwt.verify(token1, JWT_SECRET) as IAuthTokenPayload;
      const decoded2 = jwt.verify(token2, JWT_SECRET) as IAuthTokenPayload;

      expect(decoded1.userId).toBe('user1');
      expect(decoded1.username).toBe('username1');
      expect(decoded2.userId).toBe('user2');
      expect(decoded2.username).toBe('username2');
    });

    it('should include expiration in token', () => {
      const token = tokenUtil.generateAuthToken(testUserId, testUsername);
      const decoded = jwt.decode(token) as any;

      expect(decoded).toHaveProperty('exp');
      expect(decoded).toHaveProperty('iat');
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('generateGameToken', () => {
    it('should create game token with roomCode', () => {
      const newRoomCode = 'room-456';

      const gameToken = tokenUtil.parseGameToken(newRoomCode);
      const decoded = jwt.verify(gameToken, JWT_SECRET) as IGameTokenPayload;

      expect(decoded.roomCode).toBe(newRoomCode);
    });
  });

  describe('verifyAuthToken', () => {
    it('should verify and decode valid token', () => {
      const token = tokenUtil.generateAuthToken(testUserId, testUsername);
      const payload = tokenUtil.verifyToken<IAuthTokenPayload>(token);

      expect(payload).toBeDefined();
      expect(payload.userId).toBe(testUserId);
      expect(payload.username).toBe(testUsername);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.string';

      expect(() => {
        tokenUtil.verifyToken(invalidToken);
      }).toThrow();
    });

    it('should throw error for expired token', () => {
      // Create token with very short expiry
      const shortLivedToken = jwt.sign(
        {
          userId: testUserId,
          username: testUsername,
          roomId: null,
        },
        JWT_SECRET,
        { expiresIn: '0s' }
      );

      // Wait a bit to ensure expiration
      setTimeout(() => {
        expect(() => {
          tokenUtil.verifyToken(shortLivedToken);
        }).toThrow();
      }, 100);
    });
  });

  describe('verifyGameToken', () => {
    it('should verify and decode valid game token', () => {
      const roomCode = 'room-789';
      const gameToken = tokenUtil.parseGameToken(roomCode);
      const payload = tokenUtil.verifyToken<IGameTokenPayload>(gameToken);

      expect(payload).toBeDefined();
      expect(payload.roomCode).toBe(roomCode);
    });

    it('should throw error for invalid game token', () => {
      const invalidGameToken = 'invalid.game.token';

      expect(() => {
        tokenUtil.verifyToken<IGameTokenPayload>(invalidGameToken);
      }).toThrow();
    });
  });
});

