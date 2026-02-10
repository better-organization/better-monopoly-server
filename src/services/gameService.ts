// Game Service
// GameService singleton - manages all game instances
// Similar to RoomService pattern

import { Game } from '../models/Game';
import { Board } from '../models/Board';
import { DiceRollResponse, GameState } from '../types/game';
import { RoomService } from './roomService';
import { BoardService } from './boardService';

/**
 * GameService - manages all game instances
 * Singleton pattern for managing games by roomId
 */
export class GameService {
  private static instance: GameService;
  private games: Map<string, Game>;
  private static boards: Map<string, Board> = new Map();

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
  getGameState(roomCode: string): GameState | null {
    const game = this.getGameByRoomCode(roomCode);
    return game ? game.getGameState() : null;
  }

  /**
   * Get board info by roomCode
   */
  getBoardInfo(roomCode: string): { boardId: string; version: string } | null {
    const game = this.getGameByRoomCode(roomCode);
    return game ? game.getBoardInfo() : null;
  }

  /**
   * Get board layout by roomCode
   * Uses BoardService internally to retrieve the board configuration
   */
  async getBoard(roomCode: string): Promise<Board | null> {
    const boardInfo = this.getBoardInfo(roomCode);
    if (!boardInfo) {
      return null;
    }

    const key = boardInfo.boardId + boardInfo.version;

    if (GameService.boards.has(key)) {
      return GameService.boards.get(key) || null;
    }

    const newBoard = await BoardService.getBoardLayout(
      boardInfo.boardId,
      boardInfo.version
    );

    if (newBoard === null) {
      return null;
    }

    GameService.boards.set(key, newBoard);
    return newBoard;
  }

  /**
   * Roll dice action of a specific game by roomCode
   */
  rollDice(roomCode: string, userId: string): DiceRollResponse | null {
    const game = this.getGameByRoomCode(roomCode);
    return game ? game.rollDiceAndUpdatePosition(userId) : null;
  }

  endTurn(roomCode: string, userId: string): boolean {
    const game = this.getGameByRoomCode(roomCode);
    return game?.endTurn(userId)?? false;
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

  /**
   * Clear all cached boards (for testing)
   */
  clearAllBoards(): void {
    GameService.boards.clear();
  }
}
