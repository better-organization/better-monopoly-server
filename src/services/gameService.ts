// Game Service
// TODO: Implement Monopoly game logic

import { DiceRollResult } from '../types/game';
import { ITimeService, timeService } from './timeService';
import { randomUUID } from 'node:crypto';

export interface Player {
  id: string;
  name: string;
  position: number;
  money: number;
  properties: string[];
  inJail: boolean;
  jailTurns: number;
}

export interface Property {
  id: string;
  name: string;
  price: number;
  rent: number;
  owner?: string;
  houses: number;
  hotels: number;
}

export interface Game {
  id: string;
  players: Player[];
  currentPlayer: number;
  status: 'waiting' | 'active' | 'finished';
  winner?: string;
  board: Property[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GameMove {
  playerId: string;
  type: 'roll' | 'buy' | 'pay' | 'trade';
  data: unknown;
}

export class GameService {
  private static games: Map<string, any> = new Map();

  // Implement game creation
  static async createGame(playerIds: string[]) {
    const gameId = randomUUID();

    // Initialize players with starting money
    const players = playerIds;
    // Initialize board
    // Create game object
    const game = {
      id: gameId,
      players,
    };

    // Store game in memory
    this.games.set(gameId, game);

    console.log('Game created:', gameId, 'with players:', playerIds);
    return game;
  }

  // TODO: Implement player joining
  static async joinGame(_gameId: string, _playerId: string): Promise<Game> {
    console.log('joinGame called with:', _gameId, _playerId);
    return {} as Game;
  }

  // TODO: Implement game state retrieval
  static async getGame(_gameId: string): Promise<Game | null> {
    console.log('getGame called with:', _gameId);
    return null;
  }

  // TODO: Implement move processing
  static async processMove(_gameId: string, _move: GameMove): Promise<Game> {
    console.log('processMove called with:', _gameId, _move);
    return {} as Game;
  }

  // Dice rolling with structured result
  static rollDice(
    timeServiceInstance: ITimeService = timeService
  ): DiceRollResult {
    const dice: [number, number] = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ];
    const total = dice[0] + dice[1];
    const timestamp = timeServiceInstance.now();

    return {
      dice,
      total,
      timestamp,
    };
  }

  // TODO: Implement board initialization
  static initializeBoard(): Property[] {
    return [];
  }
}
