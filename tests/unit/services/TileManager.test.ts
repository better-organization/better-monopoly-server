import { TileManager, TileManagerError } from '../../../src/services/TileManager';
import { GameState, Phase, Action } from '../../../src/types/game';
import { IPlayer } from '../../../src/models/Game';
import { Board, FlattenedCell } from '../../../src/models/Board';
import {
  PropertyTile,
  TransportTile,
  UtilityTile,
  SpecialTile,
} from '../../../src/models/Tile';

describe('TileManager', () => {
  let mockGameState: GameState;
  let mockPlayers: IPlayer[];
  let mockBoard: Board;

  beforeEach(() => {
    mockPlayers = [
      {
        player_id: 'player-1',
        player_turn: 0,
        position: 1,
        player_money: 1500,
        property_owns: [],
        utility_owns: [],
        transport_owns: [],
      },
      {
        player_id: 'player-2',
        player_turn: 1,
        position: 0,
        player_money: 1500,
        property_owns: [],
        utility_owns: [],
        transport_owns: [],
      },
    ];

    mockGameState = {
      phase: Phase.RESOLVE_TILE,
      players: mockPlayers,
      turn: {
        currentPlayerIndex: 0,
        round: 1,
      },
      currentTile: undefined,
      lastDice: {
        dice: [1, 2],
        total: 3,
        double: false,
      },
      allowedActions: [Action.RESOLVE_TILE],
    };

    mockBoard = {
      edition: 'Test Edition',
      id: 'test_board',
      version: '1.0',
      currency: 'USD',
      currency_symbol: '$',
      mortgage_percentage: '50',
      sell_percentage: '50',
      terms: {} as any,
      cells: [
        {
          index: 0,
          name: 'GO',
          cell_type: 'special',
          board_id: 'test_board',
          board_versions: ['1.0'],
          action_keyword: 'go',
          action_details: 'Collect salary',
        },
        {
          index: 1,
          name: 'Test Property',
          cell_type: 'property',
          board_id: 'test_board',
          board_versions: ['1.0'],
          property_price: 100,
          house_rent: new Map([['0', 10], ['1', 20]]),
          house_price: 50,
        },
        {
          index: 2,
          name: 'Test Transport',
          cell_type: 'transport',
          board_id: 'test_board',
          board_versions: ['1.0'],
          transport_price: 200,
          transport_rent: new Map([['1', 25], ['2', 50], ['3', 100], ['4', 200]]),
        },
        {
          index: 3,
          name: 'Test Utility',
          cell_type: 'utility',
          board_id: 'test_board',
          board_versions: ['1.0'],
          utility_price: 150,
          utility_rent_multiplier: new Map([['1', 4], ['2', 10]]),
        },
      ] as FlattenedCell[],
    } as Board;
  });

  describe('buildTile', () => {
    it('should build a PropertyTile for property cell', () => {
      const cell = mockBoard.cells[1]!;
      const tile = TileManager.buildTile(cell);

      expect(tile).toBeInstanceOf(PropertyTile);
    });

    it('should build a TransportTile for transport cell', () => {
      const cell = mockBoard.cells[2]!;
      const tile = TileManager.buildTile(cell);

      expect(tile).toBeInstanceOf(TransportTile);
    });

    it('should build a UtilityTile for utility cell', () => {
      const cell = mockBoard.cells[3]!;
      const tile = TileManager.buildTile(cell);

      expect(tile).toBeInstanceOf(UtilityTile);
    });

    it('should build a SpecialTile for special cell', () => {
      const cell = mockBoard.cells[0]!;
      const tile = TileManager.buildTile(cell);

      expect(tile).toBeInstanceOf(SpecialTile);
    });

    it('should throw TileManagerError for unknown cell type', () => {
      const invalidCell = {
        index: 99,
        name: 'Invalid',
        cell_type: 'unknown',
      } as any;

      expect(() => TileManager.buildTile(invalidCell)).toThrow(TileManagerError);
      expect(() => TileManager.buildTile(invalidCell)).toThrow('Unknown cell_type: unknown');
    });
  });

  describe('resolveTile', () => {
    it('should set currentTile for unowned property', () => {
      mockGameState.players[0]!.position = 1;
      const newState = TileManager.resolveTile(mockGameState, mockBoard);

      expect(newState.currentTile).toBeDefined();
      expect(newState.currentTile?.index).toBe(1);
      expect(newState.currentTile?.type).toBe('property');
      expect(newState.currentTile?.isOwned).toBe(false);
      expect(newState.currentTile?.price).toBe(100);
    });

    it('should set currentTile for owned property', () => {
      mockGameState.players[0]!.position = 1;
      mockGameState.players[1]!.property_owns = [1]; // Player 2 owns property at index 1
      const newState = TileManager.resolveTile(mockGameState, mockBoard);

      expect(newState.currentTile).toBeDefined();
      expect(newState.currentTile?.index).toBe(1);
      expect(newState.currentTile?.isOwned).toBe(true);
      expect(newState.currentTile?.ownerId).toBe('player-2');
      expect(newState.currentTile?.isOwnerCurrentPlayer).toBe(false);
    });

    it('should set currentTile for transport', () => {
      mockGameState.players[0]!.position = 2;
      const newState = TileManager.resolveTile(mockGameState, mockBoard);

      expect(newState.currentTile).toBeDefined();
      expect(newState.currentTile?.index).toBe(2);
      expect(newState.currentTile?.type).toBe('transport');
      expect(newState.currentTile?.isOwned).toBe(false);
      expect(newState.currentTile?.price).toBe(200);
    });

    it('should set currentTile for utility', () => {
      mockGameState.players[0]!.position = 3;
      const newState = TileManager.resolveTile(mockGameState, mockBoard);

      expect(newState.currentTile).toBeDefined();
      expect(newState.currentTile?.index).toBe(3);
      expect(newState.currentTile?.type).toBe('utility');
      expect(newState.currentTile?.isOwned).toBe(false);
      expect(newState.currentTile?.price).toBe(150);
    });

    it('should handle special tile (GO)', () => {
      mockGameState.players[0]!.position = 0;
      const newState = TileManager.resolveTile(mockGameState, mockBoard);

      expect(newState.currentTile).toBeUndefined();
    });
  });

  describe('buyTile', () => {
    it('should buy property and deduct money', () => {
      mockGameState.currentTile = {
        index: 1,
        type: 'property',
        isOwned: false,
        price: 100,
      };
      mockGameState.players[0]!.player_money = 1500;

      const newState = TileManager.buyTile(mockGameState);

      expect(newState.players[0]!.property_owns).toContain(1);
      expect(newState.players[0]!.player_money).toBe(1400);
    });

    it('should buy transport and deduct money', () => {
      mockGameState.currentTile = {
        index: 2,
        type: 'transport',
        isOwned: false,
        price: 200,
      };
      mockGameState.players[0]!.player_money = 1500;

      const newState = TileManager.buyTile(mockGameState);

      expect(newState.players[0]!.transport_owns).toContain(2);
      expect(newState.players[0]!.player_money).toBe(1300);
    });

    it('should buy utility and deduct money', () => {
      mockGameState.currentTile = {
        index: 3,
        type: 'utility',
        isOwned: false,
        price: 150,
      };
      mockGameState.players[0]!.player_money = 1500;

      const newState = TileManager.buyTile(mockGameState);

      expect(newState.players[0]!.utility_owns).toContain(3);
      expect(newState.players[0]!.player_money).toBe(1350);
    });

    it('should throw error when currentTile is undefined', () => {
      mockGameState.currentTile = undefined;

      expect(() => TileManager.buyTile(mockGameState)).toThrow(TileManagerError);
      expect(() => TileManager.buyTile(mockGameState)).toThrow('Cannot buy this tile');
    });

    it('should throw error when tile is already owned', () => {
      mockGameState.currentTile = {
        index: 1,
        type: 'property',
        isOwned: true,
        ownerId: 'player-2',
        price: 100,
      };

      expect(() => TileManager.buyTile(mockGameState)).toThrow(TileManagerError);
      expect(() => TileManager.buyTile(mockGameState)).toThrow('Cannot buy this tile');
    });

    it('should throw error when player has insufficient funds', () => {
      mockGameState.currentTile = {
        index: 1,
        type: 'property',
        isOwned: false,
        price: 100,
      };
      mockGameState.players[0]!.player_money = 50;

      expect(() => TileManager.buyTile(mockGameState)).toThrow(TileManagerError);
      expect(() => TileManager.buyTile(mockGameState)).toThrow('Insufficient funds to purchase this tile');
    });

    it('should not modify original game state', () => {
      mockGameState.currentTile = {
        index: 1,
        type: 'property',
        isOwned: false,
        price: 100,
      };
      const originalMoney = mockGameState.players[0]!.player_money;
      const originalOwns = [...mockGameState.players[0]!.property_owns];

      const newState = TileManager.buyTile(mockGameState);

      expect(mockGameState.players[0]!.player_money).toBe(originalMoney);
      expect(mockGameState.players[0]!.property_owns).toEqual(originalOwns);
      expect(newState.players[0]!.player_money).toBe(originalMoney - 100);
    });
  });
});

