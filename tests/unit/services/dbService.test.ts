import { getBoardData, getCellsData } from '../../../src/services/dbService';

describe('Database Service (Mock)', () => {
  describe('getBoardData', () => {
    it('should return board data for valid board and version', () => {
      const result = getBoardData(
        'european_football_club_giants',
        '1.0'
      );
      expect(result).toBeDefined();
      expect(result.id).toBe('european_football_club_giants');
      expect(result.version).toBe('1.0');
    });

    it('should return board with edition', () => {
      const result = getBoardData(
        'european_football_club_giants',
        '1.0'
      );
      expect(result).toHaveProperty('edition');
      expect(result.edition).toBe('European Football Club Giants');
    });

    it('should return board with currency', () => {
      const result = getBoardData(
        'european_football_club_giants',
        '1.0'
      );
      expect(result).toHaveProperty('currency');
      expect(result.currency).toBe('EURO');
    });

    it('should return board with terms', () => {
      const result = getBoardData(
        'european_football_club_giants',
        '1.0'
      );
      expect(result).toHaveProperty('terms');
      expect(result.terms).toHaveProperty('player');
      expect(result.terms.player).toBe('Manager');
    });

    it('should throw error for non-existent board', () => {
      expect(() => {
        getBoardData('nonexistent', '1.0');
      }).toThrow();
    });
  });

  describe('getCellsData', () => {
    it('should return cells data for valid board and version', () => {
      const result = getCellsData(
        'european_football_club_giants',
        '1.0'
      );
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return cells with required properties', () => {
      const result = getCellsData(
        'european_football_club_giants',
        '1.0'
      );
      if (result.length > 0) {
        const cell = result[0];
        expect(cell).toHaveProperty('index');
        expect(cell).toHaveProperty('name');
        expect(cell).toHaveProperty('cell_type');
        expect(cell).toHaveProperty('board_id');
        expect(cell).toHaveProperty('board_versions');
      }
    });

    it('should include special cells (SEASON KICK-OFF)', () => {
      const result = getCellsData(
        'european_football_club_giants',
        '1.0'
      );
      const kickoffCell = result.find((c: any) => c.name === 'SEASON KICK-OFF');
      expect(kickoffCell).toBeDefined();
      expect(kickoffCell?.cell_type).toBe('special');
    });

    it('should include property cells', () => {
      const result = getCellsData(
        'european_football_club_giants',
        '1.0'
      );
      const propertyCell = result.find((c: any) => c.cell_type === 'property');
      expect(propertyCell).toBeDefined();
      expect(propertyCell?.property_details).toBeDefined();
    });

    it('should throw error for non-existent cells', () => {
      expect(() => {
        getCellsData('nonexistent', '1.0');
      }).toThrow();
    });

    it('should have consistent board_id across cells', () => {
      const result = getCellsData(
        'european_football_club_giants',
        '1.0'
      );
      const allMatch = result.every(
        (c: any) => c.board_id === 'european_football_club_giants'
      );
      expect(allMatch).toBe(true);
    });
  });
});
