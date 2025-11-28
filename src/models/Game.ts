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
    this.winner = data.winner;
    this.board = data.board;
    this.maxPlayers = data.maxPlayers;
    this.hostId = data.hostId;
    this.gameSettings = data.gameSettings;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // TODO: Add database methods
  static async findById(id: string): Promise<Game | null> {
    throw new Error('Not implemented yet');
  }

  static async findByPlayerId(playerId: string): Promise<Game[]> {
    throw new Error('Not implemented yet');
  }

  static async create(
    gameData: Omit<IGame, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Game> {
    throw new Error('Not implemented yet');
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
