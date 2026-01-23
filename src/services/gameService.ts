// Game Service
// GameManager singleton - manages all game instances
// Similar to RoomService pattern

import { Game } from '../models/Game';

/**
 * GameManager - manages all game instances
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