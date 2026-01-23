import { Request, Response } from 'express';
import { GameManager } from '../services/gameService';
import { DiceRollRequest, DiceRollData, GameStateResponse } from '../types/game';
import { ResponseType } from '../types/response';
import { RESPONSE_MESSAGES } from '../utils/responseMessages';

export class GameController {
  /**
   * GET /api/game/:roomId/state
   * Get game state for polling
   */
  static getGameState(req: Request, res: Response): void {
    try {
      const { roomId } = req.params;

      if (!roomId) {
        res.status(400).json({
          success: false,
          message: 'Room ID is required',
        });
        return;
      }

      const gameManager = GameManager.getInstance();
      const game = gameManager.getGame(roomId);

      if (!game) {
        res.status(404).json({
          success: false,
          message: 'Game not found for the room with ID: ' + roomId,
        });
        return;
      }

      const gameState = game.getState();

      const response: ResponseType<GameStateResponse> = {
        success: true,
        data: gameState,
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
   */
  static rollDice(req: Request, res: Response): void {
    try {
      const { roomId, playerId }: DiceRollRequest = req.body;

      if (!roomId || !playerId) {
        res.status(400).json({
          success: false,
          message: 'Room ID and player Id are required',
        });
        return;
      }

      console.log(`Rolling dice for room: ${roomId}, player: ${playerId}`);

      const gameManager = GameManager.getInstance();
      const game = gameManager.getGame(roomId);

      if (!game) {
        res.status(404).json({
          success: false,
          message: 'Game not found for the room with ID: ' + roomId,
        });
        return;
      }

      const diceResult = game.rollDiceAndUpdatePosition(playerId);

      if (!diceResult) {
        res.status(404).json({
          success: false,
          message: 'Player not found in this game',
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
}
