// Game Service - Instance-Based Design
// Each room has its own Game instance

import { IPlayer, DEFAULT_GAME_SETTINGS, GameSettings } from '../models/Game';
import { DiceRollResult, GameStateResponse } from '../types/game';
import { ITimeService, timeService } from './timeService';

/**
 * Game class - represents a single game instance for a room
 */
export class Game {
  public roomId: string;
  public players: IPlayer[];
  public currentPlayer: number;
  public status: 'waiting' | 'active' | 'finished';
  public winner?: string;
  public maxPlayers: number;
  public hostId: string;
  public gameSettings: GameSettings;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(roomId: string, hostId: string, maxPlayers: number = 4) {
    this.roomId = roomId;
    this.players = [];
    this.currentPlayer = 0;
    this.status = 'waiting';
    this.maxPlayers = maxPlayers;
    this.hostId = hostId;
    this.gameSettings = DEFAULT_GAME_SETTINGS;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Get current game state
   */
  getState(): GameStateResponse {
    return {
      players: this.players.map((player) => ({
        player_no: player.player_no,
        position: player.position,
        player_money: player.player_money,
        property_owns: player.property_owns,
        utility_owns: player.utility_owns,
        transport_owns: player.transport_owns,
      })),
    };
  }

  /**
   * Update player position
   */
  updatePlayerPosition(playerId: number, diceTotal: number): number {
    const player = this.players.find((p) => p.player_no === playerId);
    if (!player) throw new Error('Player not found');

    // Calculate new position (wrap around at 40)
    const newPosition = (player.position + diceTotal) % 40;
    player.position = newPosition;
    this.updatedAt = new Date();

    return newPosition;
  }

  /**
   * Roll dice and update player position
   */
  rollDiceAndUpdatePosition(
    playerId: number,
    timeServiceInstance: ITimeService = timeService
  ): DiceRollResult {
    // Roll dice
    const dice: [number, number] = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ];
    const total = dice[0] + dice[1];
    const timestamp = timeServiceInstance.now();
    // Update position
    const newPosition = this.updatePlayerPosition(playerId, total);

    const diceResult: DiceRollResult = {
      dice,
      total,
      timestamp,
      newPosition
    };

    return diceResult;
  }
}

/**
 * GameManager - manages all game instances
 * Singleton pattern for managing games by roomId
 */
export class GameManager {
  private static instance: GameManager;
  private games: Map<string, Game>;

  private constructor() {
    this.games = new Map();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }

    return GameManager.instance;
  }

  /**
   * Create a new game for a room
   */
  createGame(roomId: string, hostId: string, maxPlayers: number = 4): Game {
    const game = new Game(roomId, hostId, maxPlayers);
    this.games.set(roomId, game);
    return game;
  }

  /**
   * Get game by roomId
   */
  getGame(roomId: string): Game | null {
    return this.games.get(roomId) || null;
  }

  /**
   * Delete a game
   */
  deleteGame(roomId: string): boolean {
    return this.games.delete(roomId);
  }

  /**
   * Get all games
   */
  getAllGames(): Game[] {
    return Array.from(this.games.values());
  }

  /**
   * Clear all games
   */
  clearAllGames(): void {
    this.games.clear();
  }
}