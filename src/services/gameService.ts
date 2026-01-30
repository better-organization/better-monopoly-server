// Game Service
// GameService singleton - manages all game instances
// Similar to RoomService pattern

import { Game } from '../models/Game';
import { DiceRollResult, GameStateResponse } from '../types/game';
import { RoomService } from './roomService';

/**
 * GameService - manages all game instances
 * Singleton pattern for managing games by roomId
 */
export class GameService {
  private static instance: GameService;
  private games: Map<string, Game>;

  private constructor() {
    this.games = new Map();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): GameService {
    if (!GameService.instance) {
      GameService.instance = new GameService();
    }

    return GameService.instance;
  }

  /**
   * Create a new game for a room with a single player (for backwards compatibility)
   */
  createGame(roomId: string, players: string[], gameNumber: number = 1): Game {
    const game = new Game(roomId, players, gameNumber);
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
   * Get game by roomCode (converts roomCode to roomId first)
   */
  getGameByRoomCode(roomCode: string): Game | null {
    const roomService = RoomService.getInstance();
    const room = roomService.getRoom(roomCode);

    if (!room) return null;

    return this.getGame(room.roomId);
  }

  /**
   * Get game state by roomCode
   */
  getGameState(roomCode: string): GameStateResponse | null {
    const game = this.getGameByRoomCode(roomCode);
    return game ? game.getGameState() : null;
  }

  /**
   * Roll dice action of a specific game by roomCode
   */
  rollDice(roomCode: string, userId: string): DiceRollResult | null {
    const game = this.getGameByRoomCode(roomCode);
    return game ? game.rollDiceAndUpdatePosition(userId) : null;
  }

  /**
   * Delete a game
   */
  deleteGame(roomId: string): boolean {
    return this.games.delete(roomId);
  }

  /**
   * Get all games (for debugging)
   */
  getAllGames(): Game[] {
    return Array.from(this.games.values());
  }

  /**
   * Clear all games (for testing)
   */
  clearAllGames(): void {
    this.games.clear();
  }
}
