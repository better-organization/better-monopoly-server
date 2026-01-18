import { Request, Response } from 'express';
import { GameService } from '../services/gameService';
import { DiceRollRequest, DiceRollData } from '../types/game';
import { ResponseType } from '../types/response';
import { RESPONSE_MESSAGES } from '../utils/responseMessages';

export class GameController {
  /**
   * POST /api/game/roll-dice
   * Roll dice for a game
   */
  static async rollDice(req: Request, res: Response): Promise<void> {
    try {
      const { gameId, playerId }: DiceRollRequest = req.body;

      if (gameId) {
        console.log(`Rolling dice for game: ${gameId}`);
      }

      if (playerId) {
        console.log(`Player: ${playerId}`);
      }

      const result = GameService.rollDice();

      const response: ResponseType<DiceRollData> = {
        success: true,
        data: {
          dice: result.dice,
          total: result.total,
          timestamp: result.timestamp.toISOString(),
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
