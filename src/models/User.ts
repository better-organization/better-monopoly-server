import { AuthData } from './AuthData';
import { UserData } from './UserData';

export interface IUser {
  uniqueID: string;
  userId: string;
  username: string;
  passwordHash: string;
  experiencePoints: number | undefined;
  level: number | undefined;
  avatarUrl: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  static async userIdExists(userId: string): Promise<boolean> {
    const authExists = await AuthData.userIdExists(userId);
    return authExists;
  }

  static async findByUserId(userId: string): Promise<IUser | null> {
    const [authData, userData] = await Promise.all([
      AuthData.findByUserId(userId),
      UserData.findByUserId(userId),
    ]);

    if (!authData || !userData) {
      return null;
    }

    return {
      uniqueID: authData.uniqueID,
      userId: authData.userId,
      username: userData.username,
      passwordHash: authData.passwordHash,
      experiencePoints: userData.experiencePoints,
      level: userData.level,
      avatarUrl: userData.avatarUrl,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };
  }

  static async findByUniqueID(uniqueID: string): Promise<IUser | null> {
    const [authData, userData] = await Promise.all([
      AuthData.findByUniqueID(uniqueID),
      UserData.findByUniqueID(uniqueID),
    ]);

    if (!authData || !userData) {
      return null;
    }

    return {
      uniqueID: authData.uniqueID,
      userId: authData.userId,
      username: userData.username,
      passwordHash: authData.passwordHash,
      experiencePoints: userData.experiencePoints,
      level: userData.level,
      avatarUrl: userData.avatarUrl,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };
  }

  static async createUser(
    username: string,
    passwordHash: string,
    userId: string
  ): Promise<IUser> {
    const exists = await this.userIdExists(userId);
    if (exists) {
      throw new Error('UserId already exists');
    }

    const uniqueID = await UserData.generateUniqueID();

    try {
      const [authData, userData] = await Promise.all([
        AuthData.createAuthData(uniqueID, userId, passwordHash),
        UserData.createUserData(uniqueID, username, userId),
      ]);

      return {
        uniqueID: authData.uniqueID,
        userId: authData.userId,
        username: userData.username,
        passwordHash: authData.passwordHash,
        experiencePoints: userData.experiencePoints,
        level: userData.level,
        avatarUrl: userData.avatarUrl,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      };
    } catch (error: any) {
      await Promise.all([
        AuthData.deleteOne({ uniqueID }).catch(() => {}),
        UserData.deleteOne({ uniqueID }).catch(() => {}),
      ]);
      throw error;
    }
  }

  static async generateUniqueID(): Promise<string> {
    return UserData.generateUniqueID();
  }

  static async deleteMany(filter: any = {}): Promise<void> {
    await Promise.all([
      AuthData.deleteMany(filter),
      UserData.deleteMany(filter),
    ]);
  }
}
