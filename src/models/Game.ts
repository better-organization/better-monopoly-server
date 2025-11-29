// Game Model
// TODO: Implement with database integration

import { Player, Property } from '../services/gameService';

export interface IGame {
  id: string;
  players: Player[];
  currentPlayer: number;
  status: 'waiting' | 'active' | 'finished';
  winner?: string;
  board: Property[];
  maxPlayers: number;
  hostId: string;
  gameSettings: GameSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameSettings {
  startingMoney: number;
  passGoMoney: number;
  jailFine: number;
  houseCost: number;
  hotelCost: number;
}

export class Game {
  public id: string;
  public players: Player[];
  public currentPlayer: number;
  public status: 'waiting' | 'active' | 'finished';
  public winner?: string;
  public board: Property[];
  public maxPlayers: number;
  public hostId: string;
  public gameSettings: GameSettings;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: IGame) {
    this.id = data.id;
    this.players = data.players;
    this.currentPlayer = data.currentPlayer;
    this.status = data.status;
    if (data.winner !== undefined) {
      this.winner = data.winner;
    }
    this.board = data.board;
    this.maxPlayers = data.maxPlayers;
    this.hostId = data.hostId;
    this.gameSettings = data.gameSettings;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // TODO: Add database methods
  static async findById(_id: string): Promise<Game | null> {
    console.log('findById called with:', _id);
    return null;
  }

  static async findByPlayerId(_playerId: string): Promise<Game[]> {
    console.log('findByPlayerId called with:', _playerId);
    return [];
  }

  static async create(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _gameData: Omit<IGame, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Game> {
    return new Game({
      id: '',
      players: [],
      currentPlayer: 0,
      status: 'waiting',
      board: [],
      maxPlayers: 4,
      hostId: '',
      gameSettings: {
        startingMoney: 1500,
        passGoMoney: 200,
        jailFine: 50,
        houseCost: 100,
        hotelCost: 200,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async save(): Promise<Game> {
    throw new Error('Not implemented yet');
  }

  async delete(): Promise<void> {
    throw new Error('Not implemented yet');
  }

  // Game logic methods
  addPlayer(player: Player): boolean {
    if (this.players.length >= this.maxPlayers) {
      return false;
    }
    this.players.push(player);
    return true;
  }

  removePlayer(playerId: string): boolean {
    const index = this.players.findIndex(p => p.id === playerId);
    if (index === -1) return false;

    this.players.splice(index, 1);
    return true;
  }

  getCurrentPlayer(): Player | null {
    return this.players[this.currentPlayer] || null;
  }

  nextPlayer(): void {
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
  }

  canStart(): boolean {
    return this.players.length >= 2 && this.status === 'waiting';
  }
}
