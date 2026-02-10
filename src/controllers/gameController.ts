import { Request, Response } from 'express';
import { GameService } from '../services/gameService';
import { DiceRollData, GameStateResponse } from '../types/game';
import { ResponseType } from '../types/response';
import { RESPONSE_MESSAGES } from '../utils/responseMessages';

export class GameController {
  /**
   * GET /api/game/state
   * Get game state for polling
   * Gets roomCode from user token (cookie)
   */
  static getGameState(req: Request, res: Response): void {
    try {
      const roomCode = req.user?.roomCode;
      const userId = req.user?.userId;

      if (!userId || !roomCode) {
        res.status(400).json({
          success: false,
          message: RESPONSE_MESSAGES.REQUIRED_PROPERTY_NOT_FOUND_IN_TOKEN,
        });
        return;
      }

      const gameService = GameService.getInstance();
      const gameState = gameService.getGameState(roomCode);

      if (!gameState) {
        res.status(404).json({
          success: false,
          message: 'Game not found for this room',
        });
        return;
      }

      const response: ResponseType<GameStateResponse> = {
        success: true,
        data: { ...gameState, you: userId },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get game state error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while retrieving game state',
      });
    }
  }

  /**
   * POST /api/game/roll-dice
   * Roll dice for a game and update player position
   * Gets roomCode from user token (cookie)
   */
  static rollDice(req: Request, res: Response): void {
    try {
      const roomCode = req.user?.roomCode;
      const userId = req.user?.userId;

      if (!userId || !roomCode) {
        res.status(400).json({
          success: false,
          message: RESPONSE_MESSAGES.REQUIRED_PROPERTY_NOT_FOUND_IN_TOKEN,
        });
        return;
      }

      console.log(`Rolling dice for room: ${roomCode}, player: ${userId}`);

      const gameService = GameService.getInstance();
      const diceResult = gameService.rollDice(roomCode, userId);

      if (!diceResult) {
        res.status(404).json({
          success: false,
          message: 'Game or player not found',
        });
        return;
      }

      const response: ResponseType<DiceRollData> = {
        success: true,
        data: {
          dice: diceResult.dice,
          total: diceResult.total,
          timestamp: diceResult.timestamp.toISOString(),
          newPosition: diceResult.newPosition,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Roll dice error:', error);
      res.status(500).json({
        success: false,
        message: RESPONSE_MESSAGES.ROLL_DICE_ERROR,
      });
    }
  }

  /**
   * GET /api/game/board
   * Get board layout for the user's assigned game
   * Gets roomCode from user token and retrieves board info from the game
   */
  static async getBoard(req: Request, res: Response): Promise<void> {
    try {
      const roomCode = req.user?.roomCode;
      const userId = req.user?.userId;

      if (!userId || !roomCode) {
        res.status(400).json({
          success: false,
          message: RESPONSE_MESSAGES.REQUIRED_PROPERTY_NOT_FOUND_IN_TOKEN,
        });
        return;
      }

      const gameService = GameService.getInstance();
      const board = await gameService.getBoard(roomCode);

      if (!board) {
        res.status(404).json({
          success: false,
          message: 'Board not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: board,
      });
    } catch (error) {
      console.error('Get board for user game error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while retrieving board',
      });
    }
  }

  /**
   * POST /api/game/end-turn
   * End the current player's turn
   * Gets roomCode from user token (cookie)
   */
  static endTurn(req: Request, res: Response): void {
    try {
      const roomCode = req.user?.roomCode;
      const userId = req.user?.userId;

      if (!userId || !roomCode) {
        res.status(400).json({
          success: false,
          message: RESPONSE_MESSAGES.REQUIRED_PROPERTY_NOT_FOUND_IN_TOKEN,
        });
        return;
      }

      console.log(`Ending turn for room: ${roomCode}, player: ${userId}`);

      const gameService = GameService.getInstance();
      const result = gameService.endTurn(roomCode, userId);

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Game not found or unable to end turn',
        });
        return;
      }

      const response: ResponseType<{ success: boolean }> = {
        success: true,
        data: { success: true },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('End turn error:', error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'An error occurred while ending turn',
      });
    }
  }
}
