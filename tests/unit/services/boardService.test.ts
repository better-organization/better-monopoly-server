import { BoardService } from '../../../src/services/boardService';
import { Cell } from '../../../src/models/Board';

describe('BoardService', () => {
  describe('getBoardLayout', () => {
    it('should return board layout for valid board and version', async () => {
      const result = await BoardService.getBoardLayout(
        'european_football_club_giants',
        '1.0'
      );
      expect(result).not.toBeNull();
      expect(result?.id).toBe('european_football_club_giants');
      expect(result?.version).toBe('1.0');
    });

    it('should include board metadata in result', async () => {
      const result = await BoardService.getBoardLayout(
        'european_football_club_giants',
        '1.0'
      );
      expect(result).toHaveProperty('edition');
      expect(result).toHaveProperty('currency');
      expect(result).toHaveProperty('currency_symbol');
      expect(result).toHaveProperty('terms');
    });

    it('should include flattened cells in result', async () => {
      const result = await BoardService.getBoardLayout(
        'european_football_club_giants',
        '1.0'
      );
      expect(result?.cells).toBeDefined();
      expect(Array.isArray(result?.cells)).toBe(true);
      if (result?.cells && result.cells.length > 0) {
        const cell = result.cells[0];
        expect(cell).toHaveProperty('index');
        expect(cell).toHaveProperty('name');
        expect(cell).toHaveProperty('cell_type');
      }
    });

    it('should return null for non-existent board', async () => {
      const result = await BoardService.getBoardLayout(
        'nonexistent',
        '1.0'
      );
      expect(result).toBeNull();
    });

    it('should return null for invalid version', async () => {
      const result = await BoardService.getBoardLayout(
        'european_football_club_giants',
        '999.0'
      );
      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      const result = await BoardService.getBoardLayout(
        'invalid/path',
        '1.0'
      );
      expect(result).toBeNull();
    });
  });

  describe('flattenCells', () => {
    it('should flatten cells with special details', () => {
      const mockCells: Cell[] = [
        {
          index: 1,
          name: 'SEASON KICK-OFF',
          cell_type: 'special',
          board_id: 'test',
          board_versions: ['1.0'],
          special_details: {
            action_keyword: 'salary',
            action_details: 'Collect €200',
          },
        },
      ];

      const result = BoardService.flattenCells(mockCells);
      expect(result[0]).toHaveProperty('action_keyword');
      expect(result[0]?.action_keyword).toBe('salary');
    });

    it('should flatten cells with property details', () => {
      const mockCells: Cell[] = [
        {
          index: 2,
          name: 'Test Property',
          cell_type: 'property',
          board_id: 'test',
          board_versions: ['1.0'],
          property_details: {
            house_rent: new Map([['0', 2]]),
            house_price: 50,
            property_price: 60,
          },
        },
      ];

      const result = BoardService.flattenCells(mockCells);
      expect(result[0]).toHaveProperty('house_price');
      expect(result[0]).toHaveProperty('property_price');
    });

    it('should preserve non-detail properties', () => {
      const mockCells: Cell[] = [
        {
          index: 1,
          name: 'Test Cell',
          cell_type: 'special',
          cell_sub_type: 'Corner',
          board_id: 'test',
          board_versions: ['1.0'],
        },
      ];

      const result = BoardService.flattenCells(mockCells);
      expect(result[0]?.index).toBe(1);
      expect(result[0]?.name).toBe('Test Cell');
      expect(result[0]?.cell_sub_type).toBe('Corner');
    });

    it('should handle cells with multiple detail types', () => {
      const mockCells: Cell[] = [
        {
          index: 1,
          name: 'Complex Cell',
          cell_type: 'mixed',
          board_id: 'test',
          board_versions: ['1.0'],
          special_details: { action_keyword: 'test', action_details: 'test' },
          property_details: {
            house_rent: new Map(),
            house_price: 50,
            property_price: 60,
          },
        },
      ];

      const result = BoardService.flattenCells(mockCells);
      expect(result[0]).toHaveProperty('action_keyword');
      expect(result[0]).toHaveProperty('house_price');
    });

    it('should handle empty cells array', () => {
      const mockCells: Cell[] = [];
      const result = BoardService.flattenCells(mockCells);
      expect(result).toEqual([]);
    });
  });
});

