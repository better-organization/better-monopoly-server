// User Model
// TODO: Implement with database integration

export interface IUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  totalGamesPlayed: number;
  gamesWon: number;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  public id: string;
  public username: string;
  public email: string;
  public passwordHash: string;
  public avatar?: string;
  public totalGamesPlayed: number;
  public gamesWon: number;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: IUser) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.passwordHash = data.passwordHash;
    this.avatar = data.avatar;
    this.totalGamesPlayed = data.totalGamesPlayed;
    this.gamesWon = data.gamesWon;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // TODO: Add database methods
  static async findById(_id: string): Promise<User | null> {
    console.log('findById called with:', _id);
    return null;
  }

  static async findByEmail(_email: string): Promise<User | null> {
    console.log('findByEmail called with:', _email);
    return null;
  }

  static async create(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userData: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<User> {
    return new User({
      id: '',
      username: '',
      email: '',
      passwordHash: '',
      avatar: '',
      totalGamesPlayed: 0,
      gamesWon: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async save(): Promise<User> {
    throw new Error('Not implemented yet');
  }

  async delete(): Promise<void> {
    throw new Error('Not implemented yet');
  }

  // Get user without sensitive information
  toPublicObject() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      avatar: this.avatar,
      totalGamesPlayed: this.totalGamesPlayed,
      gamesWon: this.gamesWon,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
