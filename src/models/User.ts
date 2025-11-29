// User Model with In-Memory Storage
// TODO: Replace with MongoDB integration later

export interface IUser {
  id: number; // Primary Key (Auto-incrementing integer)
  userId: string; // UUID for JWT payload
  username: string; // Unique username
  password_hash: string; // Bcrypt hashed password
}

// In-memory storage for users (simulating database)
class UserStorage {
  private users: Map<string, IUser> = new Map(); // username -> user
  private usersByUserId: Map<string, IUser> = new Map(); // userId -> user
  private nextId: number = 1;

  // Find user by username
  findByUsername(username: string): IUser | null {
    return this.users.get(username) || null;
  }

  // Find user by userId (for JWT validation)
  findByUserId(userId: string): IUser | null {
    return this.usersByUserId.get(userId) || null;
  }

  // Create new user with custom userId
  create(username: string, passwordHash: string, customUserId: string): IUser {
    const newUser: IUser = {
      id: this.nextId++,
      userId: customUserId,
      username,
      password_hash: passwordHash,
    };

    this.users.set(username, newUser);
    this.usersByUserId.set(newUser.userId, newUser);

    return newUser;
  }

  // Check if username exists
  usernameExists(username: string): boolean {
    return this.users.has(username);
  }

  // Check if userId exists
  userIdExists(userId: string): boolean {
    return this.usersByUserId.has(userId);
  }

  // Get all users (for debugging)
  getAllUsers(): IUser[] {
    return Array.from(this.users.values());
  }

  // Clear storage (for testing)
  clear(): void {
    this.users.clear();
    this.usersByUserId.clear();
    this.nextId = 1;
  }
}

// Singleton instance for in-memory storage
const userStorage = new UserStorage();

export class User {
  public id: number;
  public userId: string;
  public username: string;
  public password_hash: string;

  constructor(data: IUser) {
    this.id = data.id;
    this.userId = data.userId;
    this.username = data.username;
    this.password_hash = data.password_hash;
  }

  // Static methods for user operations
  static findByUsername(username: string): User | null {
    const userData = userStorage.findByUsername(username);
    return userData ? new User(userData) : null;
  }

  static findByUserId(userId: string): User | null {
    const userData = userStorage.findByUserId(userId);
    return userData ? new User(userData) : null;
  }

  static create(
    username: string,
    passwordHash: string,
    customUserId: string
  ): User {
    const userData = userStorage.create(username, passwordHash, customUserId);
    return new User(userData);
  }

  static usernameExists(username: string): boolean {
    return userStorage.usernameExists(username);
  }

  static userIdExists(userId: string): boolean {
    return userStorage.userIdExists(userId);
  }

  // Get user without sensitive information (for API responses)
  toPublicObject() {
    return {
      id: this.id,
      userId: this.userId,
      username: this.username,
    };
  }

  // For debugging/testing
  static getAllUsers(): User[] {
    return userStorage.getAllUsers().map(userData => new User(userData));
  }

  static clearStorage(): void {
    userStorage.clear();
  }
}
