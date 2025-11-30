jest.mock('../../../src/services/boardService');

import { Request, Response } from 'express';
import { BoardController } from '../../../src/controllers/boardController';
import { BoardService } from '../../../src/services/boardService';

describe('BoardController', () => {
  describe('getBoardLayout', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
      jsonMock = jest.fn().mockReturnValue({});
      statusMock = jest.fn().mockReturnValue({ json: jsonMock });
      mockRes = {
        status: statusMock,
        json: jsonMock,
      };
      jest.clearAllMocks();
      // Mock successful response by default
      (BoardService.getBoardLayout as jest.Mock).mockResolvedValue({
        id: 'european_football_club_giants',
        version: '1.0',
        edition: 'European Football Club Giants',
        currency: 'EURO',
        currency_symbol: '€',
        mortgage_percentage: '25%',
        sell_percentage: '50%',
        terms: { player: 'Manager' },
        cells: [],
      });
    });

    it('should return board layout for valid board and version', async () => {
      mockReq = {
        params: {
          boardId: 'european_football_club_giants',
          version: '1.0',
        },
      };

      await BoardController.getBoardLayout(
        mockReq as Request,
        mockRes as Response
      );

      expect(jsonMock).toHaveBeenCalled();
      const result = jsonMock.mock.calls[0][0];
      expect(result).toHaveProperty('id');
      expect(result.id).toBe('european_football_club_giants');
      expect(result).toHaveProperty('cells');
    });

    it('should return 400 for missing boardId parameter', async () => {
      mockReq = {
        params: {
          version: '1.0',
        },
      };

      await BoardController.getBoardLayout(
        mockReq as Request,
        mockRes as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      const result = jsonMock.mock.calls[0][0];
      expect(result.error).toBe('MISSING_PARAMETERS');
    });

    it('should return 400 for missing version parameter', async () => {
      mockReq = {
        params: {
          boardId: 'european_football_club_giants',
        },
      };

      await BoardController.getBoardLayout(
        mockReq as Request,
        mockRes as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      const result = jsonMock.mock.calls[0][0];
      expect(result.error).toBe('MISSING_PARAMETERS');
    });

    it('should return 400 for both missing parameters', async () => {
      mockReq = {
        params: {},
      };

      await BoardController.getBoardLayout(
        mockReq as Request,
        mockRes as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should return 404 for non-existent board', async () => {
      (BoardService.getBoardLayout as jest.Mock).mockResolvedValue(null);

      mockReq = {
        params: {
          boardId: 'nonexistent',
          version: '1.0',
        },
      };

      await BoardController.getBoardLayout(
        mockReq as Request,
        mockRes as Response
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      const result = jsonMock.mock.calls[0][0];
      expect(result.error).toBe('BOARD_NOT_FOUND');
    });

    it('should return 404 for non-existent version', async () => {
      (BoardService.getBoardLayout as jest.Mock).mockResolvedValue(null);

      mockReq = {
        params: {
          boardId: 'european_football_club_giants',
          version: '999.0',
        },
      };

      await BoardController.getBoardLayout(
        mockReq as Request,
        mockRes as Response
      );

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it('should return 500 for unexpected errors', async () => {
      (BoardService.getBoardLayout as any).mockRejectedValue(
        new Error('Unexpected database error')
      );

      mockReq = {
        params: {
          boardId: 'european_football_club_giants',
          version: '1.0',
        },
      };

      await BoardController.getBoardLayout(
        mockReq as Request,
        mockRes as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      const result = jsonMock.mock.calls[0][0];
      expect(result.error).toBe('INTERNAL_SERVER_ERROR');
    });

    it('should validate board exists in response', async () => {
      mockReq = {
        params: {
          boardId: 'european_football_club_giants',
          version: '1.0',
        },
      };

      await BoardController.getBoardLayout(
        mockReq as Request,
        mockRes as Response
      );

      const result = jsonMock.mock.calls[0][0];
      expect(result).toHaveProperty('cells');
      expect(Array.isArray(result.cells)).toBe(true);
    });

    it('should include board metadata in response', async () => {
      mockReq = {
        params: {
          boardId: 'european_football_club_giants',
          version: '1.0',
        },
      };

      await BoardController.getBoardLayout(
        mockReq as Request,
        mockRes as Response
      );

      const result = jsonMock.mock.calls[0][0];
      expect(result).toHaveProperty('edition');
      expect(result).toHaveProperty('currency');
      expect(result).toHaveProperty('terms');
      expect(result.terms).toHaveProperty('player');
    });

    it('should return flattened cells with merged properties', async () => {
      // Mock with cells that have properties
      (BoardService.getBoardLayout as jest.Mock).mockResolvedValue({
        id: 'european_football_club_giants',
        version: '1.0',
        edition: 'European Football Club Giants',
        currency: 'EURO',
        currency_symbol: '€',
        mortgage_percentage: '25%',
        sell_percentage: '50%',
        terms: { player: 'Manager' },
        cells: [
          {
            index: 1,
            name: 'Test Cell',
            cell_type: 'property',
          },
        ],
      });

      mockReq = {
        params: {
          boardId: 'european_football_club_giants',
          version: '1.0',
        },
      };

      await BoardController.getBoardLayout(
        mockReq as Request,
        mockRes as Response
      );

      const result = jsonMock.mock.calls[0][0];
      expect(result.cells.length).toBeGreaterThan(0);
      // Verify cells don't have nested detail objects
      const cell = result.cells[0];
      expect(cell.special_details).toBeUndefined();
      expect(cell.property_details).toBeUndefined();
    });
  });
});

