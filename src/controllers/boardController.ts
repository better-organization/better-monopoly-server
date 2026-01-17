import { Request, Response } from 'express';
import { BoardService } from '../services/boardService';
export class BoardController {
  static async getBoardLayout(req: Request, res: Response) {
    const { boardId, version } = req.params;
    try {
      if (!boardId || !version) {
        return res.status(400).json({ error: 'MISSING_PARAMETERS' });
      }
      const result = await BoardService.getBoardLayout(boardId, version);
      if (!result) {
        return res.status(404).json({ error: 'BOARD_NOT_FOUND' });
      }
      return res.json(result);
    } catch (error) {
      console.error("Get board layout error: ", error);
      return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  }
}
