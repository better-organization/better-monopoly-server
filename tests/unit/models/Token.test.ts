import { Token, tokenPayload } from '../../../src/models/Token';
import jwt from 'jsonwebtoken';

describe('Token Model', () => {
  const JWT_SECRET = process.env['JWT_SECRET'] || 'a-string-secret-at-least-256-bits-long';
  const testUserId = 'user-123';
  const testUsername = 'testUser';

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = Token.generateToken(testUserId, testUsername);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate token with correct payload', () => {
      const token = Token.generateToken(testUserId, testUsername);
      const decoded = jwt.verify(token, JWT_SECRET) as tokenPayload;

      expect(decoded.userId).toBe(testUserId);
      expect(decoded.username).toBe(testUsername);
      expect(decoded.roomCode).toBeNull();
      expect(decoded.gameId).toBeNull();
    });

    it('should generate different tokens for different users', () => {
      const token1 = Token.generateToken('user1', 'username1');
      const token2 = Token.generateToken('user2', 'username2');

      expect(token1).not.toBe(token2);

      const decoded1 = jwt.verify(token1, JWT_SECRET) as tokenPayload;
      const decoded2 = jwt.verify(token2, JWT_SECRET) as tokenPayload;

      expect(decoded1.userId).toBe('user1');
      expect(decoded1.username).toBe('username1');
      expect(decoded2.userId).toBe('user2');
      expect(decoded2.username).toBe('username2');
    });

    it('should include expiration in token', () => {
      const token = Token.generateToken(testUserId, testUsername);
      const decoded = jwt.decode(token) as any;

      expect(decoded).toHaveProperty('exp');
      expect(decoded).toHaveProperty('iat');
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('updateRoomCode', () => {
    it('should update roomCode in existing token', () => {
      const originalToken = Token.generateToken(testUserId, testUsername);
      const newRoomCode = 'room-456';

      const updatedToken = Token.updateRoomCode(originalToken, newRoomCode);
      const decoded = jwt.verify(updatedToken, JWT_SECRET) as tokenPayload;

      expect(decoded.userId).toBe(testUserId);
      expect(decoded.username).toBe(testUsername);
      expect(decoded.roomCode).toBe(newRoomCode);
      expect(decoded.gameId).toBeNull();
    });

    it('should preserve userId and username when updating roomCode', () => {
      const originalToken = Token.generateToken('original-user', 'originalName');
      const updatedToken = Token.updateRoomCode(originalToken, 'new-room-code');

      const decoded = jwt.verify(updatedToken, JWT_SECRET) as tokenPayload;

      expect(updatedToken).not.toBe(originalToken);
      expect(updatedToken.length).toBeGreaterThan(0);
      expect(decoded.userId).toBe('original-user');
      expect(decoded.username).toBe('originalName');
      expect(decoded.roomCode).toBe('new-room-code');
      expect(decoded.gameId).toBeNull();
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        Token.updateRoomCode(invalidToken, 'room-code');
      }).toThrow();
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode valid token', () => {
      const token = Token.generateToken(testUserId, testUsername);
      const payload = Token.verifyToken(token);

      expect(payload).toBeDefined();
      expect(payload.userId).toBe(testUserId);
      expect(payload.username).toBe(testUsername);
      expect(payload.roomCode).toBeNull();
      expect(payload.gameId).toBeNull();
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.string';

      expect(() => {
        Token.verifyToken(invalidToken);
      }).toThrow();
    });

    it('should throw error for expired token', () => {
      // Create token with very short expiry
      const shortLivedToken = jwt.sign(
        {
          userId: testUserId,
          username: testUsername,
          roomId: null,
          gameId: null,
        },
        JWT_SECRET,
        { expiresIn: '0s' }
      );

      // Wait a bit to ensure expiration
      setTimeout(() => {
        expect(() => {
          Token.verifyToken(shortLivedToken);
        }).toThrow();
      }, 100);
    });
  });
});

