import jwt from 'jsonwebtoken';

export interface tokenPayload {
  userId: string;
  username: string;
  roomCode: string | null;
  gameId: string | null;
}

export class Token {
  private static parse(userId: string, username: string) {
    return { userId, username, gameId: null, roomCode: null };
  }

  static generateToken = (userId: string, username: string): string => {
    const JWT_SECRET =
      process.env['JWT_SECRET'] || 'a-string-secret-at-least-256-bits-long';
    const JWT_EXPIRE = process.env['JWT_EXPIRE'] || '30d';
    return jwt.sign(Token.parse(userId, username), JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    } as jwt.SignOptions);
  };

  static updateRoomCode = (token: string, roomId: string): string => {
    const JWT_SECRET =
      process.env['JWT_SECRET'] || 'a-string-secret-at-least-256-bits-long';
    const decoded = jwt.verify(token, JWT_SECRET) as tokenPayload;
    const newPayload = {
      userId: decoded.userId,
      username: decoded.username,
      gameId: decoded.gameId,
      roomCode: roomId,
    };
    return jwt.sign(newPayload, JWT_SECRET, {
      expiresIn: process.env['JWT_EXPIRE'] || '30d',
    } as jwt.SignOptions);
  };

  static verifyToken = (token: string): tokenPayload => {
    const JWT_SECRET =
      process.env['JWT_SECRET'] || 'a-string-secret-at-least-256-bits-long';
    return jwt.verify(token, JWT_SECRET) as tokenPayload;
  };
}
