import { Request, Response } from 'express';
import { BoardService } from '../services/boardService';
import { RESPONSE_MESSAGES } from '../utils/responseMessages';

export class BoardController {
  static async getBoardLayout(req: Request, res: Response) {
    const { boardId, version } = req.params;
    try {
      if (!boardId || !version) {
        return res.status(400).json({
          success: false,
          message: RESPONSE_MESSAGES.BOARD_MISSING_PARAMETERS,
        });
      }
      const result = await BoardService.getBoardLayout(boardId, version);
      if (!result) {
        return res.status(404).json({
          success: false,
          message: RESPONSE_MESSAGES.BOARD_NOT_FOUND,
        });
      }
      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get board layout error: ', error);
      return res.status(500).json({
        success: false,
        message: RESPONSE_MESSAGES.BOARD_INTERNAL_ERROR,
      });
    }
  }
}
