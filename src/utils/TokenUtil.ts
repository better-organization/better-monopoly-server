import jwt from 'jsonwebtoken';

export interface IAuthTokenPayload {
  userId: string;
  username: string;
}

export interface IGameTokenPayload {
  roomCode: string;
}

export interface IUserTokenPayload {
  userId: string;
  username: string;
  roomCode?: string;
  gameId?: string | null;
}

export class tokenUtil {
  static generateAuthToken = (userId: string, username: string): string => {
    const JWT_SECRET =
      process.env['JWT_SECRET'] || 'a-string-secret-at-least-256-bits-long';
    const JWT_EXPIRE = process.env['JWT_EXPIRE'] || '30d';
    return jwt.sign({ userId, username }, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    } as jwt.SignOptions);
  };

  static parseGameToken = (roomCode: string): string => {
    const JWT_SECRET =
      process.env['JWT_SECRET'] || 'a-string-secret-at-least-256-bits-long';
    const JWT_EXPIRE = process.env['JWT_EXPIRE'] || '30d';
    return jwt.sign({ roomCode }, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    } as jwt.SignOptions);
  };

  static verifyToken = <T>(token: string): T => {
    const JWT_SECRET =
      process.env['JWT_SECRET'] || 'a-string-secret-at-least-256-bits-long';
    return jwt.verify(token, JWT_SECRET) as T;
  };
}
