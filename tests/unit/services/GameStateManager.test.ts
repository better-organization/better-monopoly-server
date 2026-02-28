import { GameStateManager } from '../../../src/services/GameStateManager';
import { GameState, Phase, Action, DiceRollResult } from '../../../src/types/game';
import { IPlayer, GameSettings, DEFAULT_GAME_SETTINGS } from '../../../src/models/Game';
import { FlattenedCell } from '../../../src/models/Board';

describe('GameStateManager', () => {
  let mockPlayers: IPlayer[];
  let mockGameState: GameState;
  let mockGameSettings: GameSettings;

  beforeEach(() => {
    mockPlayers = [
      {
        player_id: 'player-1',
        player_turn: 0,
        position: 0,
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
      phase: Phase.ROLL_DICE,
      players: [...mockPlayers],
      turn: {
        currentPlayerIndex: 0,
        round: 1,
      },
      currentTile: undefined,
      lastDice: undefined,
      allowedActions: [Action.ROLL_DICE],
    };

    mockGameSettings = { ...DEFAULT_GAME_SETTINGS };
  });

  describe('initializeGameState', () => {
    it('should initialize game state with correct starting phase', () => {
      const playerIds = ['player-1', 'player-2'];
      const gameState = GameStateManager.initializeGameState(playerIds, mockGameSettings);

      expect(gameState.phase).toBe(Phase.ROLL_DICE);
    });

    it('should initialize players with correct starting money', () => {
      const playerIds = ['player-1', 'player-2', 'player-3'];
      const gameState = GameStateManager.initializeGameState(playerIds, mockGameSettings);

      expect(gameState.players).toHaveLength(3);
      gameState.players.forEach(player => {
        expect(player.player_money).toBe(mockGameSettings.startingMoney);
      });
    });

    it('should initialize players at starting position (0)', () => {
      const playerIds = ['player-1'];
      const gameState = GameStateManager.initializeGameState(playerIds, mockGameSettings);

      expect(gameState.players[0]?.position).toBe(0);
    });

    it('should initialize players with empty property arrays', () => {
      const playerIds = ['player-1', 'player-2'];
      const gameState = GameStateManager.initializeGameState(playerIds, mockGameSettings);

      gameState.players.forEach(player => {
        expect(player.property_owns).toEqual([]);
        expect(player.utility_owns).toEqual([]);
        expect(player.transport_owns).toEqual([]);
      });
    });

    it('should initialize turn with correct starting values', () => {
      const playerIds = ['player-1', 'player-2'];
      const gameState = GameStateManager.initializeGameState(playerIds, mockGameSettings);

      expect(gameState.turn.currentPlayerIndex).toBe(0);
      expect(gameState.turn.round).toBe(1);
    });

    it('should initialize with correct allowed actions', () => {
      const playerIds = ['player-1'];
      const gameState = GameStateManager.initializeGameState(playerIds, mockGameSettings);

      expect(gameState.allowedActions).toContain(Action.ROLL_DICE);
    });

    it('should assign correct player_turn indices', () => {
      const playerIds = ['player-1', 'player-2', 'player-3'];
      const gameState = GameStateManager.initializeGameState(playerIds, mockGameSettings);

      expect(gameState.players[0]?.player_turn).toBe(0);
      expect(gameState.players[1]?.player_turn).toBe(1);
      expect(gameState.players[2]?.player_turn).toBe(2);
    });
  });

  describe('initializePlayers', () => {
    it('should create correct number of players', () => {
      const playerIds = ['p1', 'p2', 'p3', 'p4'];
      const players = GameStateManager.initializePlayers(playerIds, mockGameSettings);

      expect(players).toHaveLength(4);
    });

    it('should assign player_id correctly', () => {
      const playerIds = ['alice', 'bob'];
      const players = GameStateManager.initializePlayers(playerIds, mockGameSettings);

      expect(players[0]?.player_id).toBe('alice');
      expect(players[1]?.player_id).toBe('bob');
    });

    it('should use custom starting money from settings', () => {
      const customSettings = { ...mockGameSettings, startingMoney: 2000 };
      const players = GameStateManager.initializePlayers(['p1'], customSettings);

      expect(players[0]?.player_money).toBe(2000);
    });
  });

  describe('shallowCopyGameState', () => {
    it('should create a new game state object', () => {
      const copy = GameStateManager.shallowCopyGameState(mockGameState);

      expect(copy).not.toBe(mockGameState);
    });

    it('should copy all properties correctly', () => {
      const copy = GameStateManager.shallowCopyGameState(mockGameState);

      expect(copy.phase).toBe(mockGameState.phase);
      expect(copy.turn.currentPlayerIndex).toBe(mockGameState.turn.currentPlayerIndex);
      expect(copy.turn.round).toBe(mockGameState.turn.round);
    });

    it('should create new arrays for players and allowedActions', () => {
      const copy = GameStateManager.shallowCopyGameState(mockGameState);

      expect(copy.players).not.toBe(mockGameState.players);
      expect(copy.allowedActions).not.toBe(mockGameState.allowedActions);
    });

    it('should handle undefined currentTile', () => {
      mockGameState.currentTile = undefined;
      const copy = GameStateManager.shallowCopyGameState(mockGameState);

      expect(copy.currentTile).toBeUndefined();
    });

    it('should copy currentTile when defined', () => {
      mockGameState.currentTile = {
        index: 5,
        type: 'property',
        isOwned: false,
        price: 100,
      };
      const copy = GameStateManager.shallowCopyGameState(mockGameState);

      expect(copy.currentTile).toBeDefined();
      expect(copy.currentTile?.index).toBe(5);
    });
  });

  describe('changePhaseAndAllowedAction', () => {
    it('should change phase to new value', () => {
      const newState = GameStateManager.changePhaseAndAllowedAction(
        mockGameState,
        Phase.MOVE_PLAYER,
        [Action.MOVE_PLAYER]
      );

      expect(newState.phase).toBe(Phase.MOVE_PLAYER);
    });

    it('should update allowed actions', () => {
      const newState = GameStateManager.changePhaseAndAllowedAction(
        mockGameState,
        Phase.BUY_PROPERTY,
        [Action.BUY_PROPERTY, Action.SKIP_BUY]
      );

      expect(newState.allowedActions).toEqual([Action.BUY_PROPERTY, Action.SKIP_BUY]);
    });

    it('should not modify original state', () => {
      const originalPhase = mockGameState.phase;
      GameStateManager.changePhaseAndAllowedAction(
        mockGameState,
        Phase.END_TURN,
        [Action.END_TURN]
      );

      expect(mockGameState.phase).toBe(originalPhase);
    });
  });

  describe('changeTurn', () => {
    it('should change to next player index', () => {
      const newState = GameStateManager.changeTurn(mockGameState, 1, false);

      expect(newState.turn.currentPlayerIndex).toBe(1);
    });

    it('should increment round when isNextRound is true', () => {
      const newState = GameStateManager.changeTurn(mockGameState, 0, true);

      expect(newState.turn.round).toBe(2);
    });

    it('should not increment round when isNextRound is false', () => {
      const newState = GameStateManager.changeTurn(mockGameState, 1, false);

      expect(newState.turn.round).toBe(1);
    });

    it('should clear currentTile', () => {
      mockGameState.currentTile = {
        index: 5,
        type: 'property',
        isOwned: false,
        price: 100,
      };
      const newState = GameStateManager.changeTurn(mockGameState, 1, false);

      expect(newState.currentTile).toBeUndefined();
    });

    it('should not modify original state', () => {
      const originalIndex = mockGameState.turn.currentPlayerIndex;
      GameStateManager.changeTurn(mockGameState, 1, false);

      expect(mockGameState.turn.currentPlayerIndex).toBe(originalIndex);
    });
  });

  describe('addDiceResult', () => {
    it('should add dice result to game state', () => {
      const diceResult: DiceRollResult = {
        dice: [3, 4],
        total: 7,
        double: false,
      };
      const newState = GameStateManager.addDiceResult(mockGameState, diceResult);

      expect(newState.lastDice).toEqual(diceResult);
    });

    it('should handle double rolls', () => {
      const diceResult: DiceRollResult = {
        dice: [5, 5],
        total: 10,
        double: true,
      };
      const newState = GameStateManager.addDiceResult(mockGameState, diceResult);

      expect(newState.lastDice?.double).toBe(true);
    });

    it('should not modify original state', () => {
      const diceResult: DiceRollResult = {
        dice: [2, 3],
        total: 5,
        double: false,
      };
      GameStateManager.addDiceResult(mockGameState, diceResult);

      expect(mockGameState.lastDice).toBeUndefined();
    });
  });

  describe('changePlayerInfo', () => {
    it('should update player money', () => {
      const newState = GameStateManager.changePlayerInfo(
        mockGameState,
        { player_money: 1200 },
        0
      );

      expect(newState.players[0]?.player_money).toBe(1200);
    });

    it('should update player position', () => {
      const newState = GameStateManager.changePlayerInfo(
        mockGameState,
        { position: 10 },
        0
      );

      expect(newState.players[0]?.position).toBe(10);
    });

    it('should update property_owns array', () => {
      const newState = GameStateManager.changePlayerInfo(
        mockGameState,
        { property_owns: [1, 3, 5] },
        0
      );

      expect(newState.players[0]?.property_owns).toEqual([1, 3, 5]);
    });

    it('should update utility_owns array', () => {
      const newState = GameStateManager.changePlayerInfo(
        mockGameState,
        { utility_owns: [12, 28] },
        1
      );

      expect(newState.players[1]?.utility_owns).toEqual([12, 28]);
    });

    it('should update transport_owns array', () => {
      const newState = GameStateManager.changePlayerInfo(
        mockGameState,
        { transport_owns: [5, 15, 25] },
        0
      );

      expect(newState.players[0]?.transport_owns).toEqual([5, 15, 25]);
    });

    it('should update multiple properties at once', () => {
      const newState = GameStateManager.changePlayerInfo(
        mockGameState,
        {
          position: 7,
          player_money: 1300,
          property_owns: [2, 4],
        },
        0
      );

      expect(newState.players[0]?.position).toBe(7);
      expect(newState.players[0]?.player_money).toBe(1300);
      expect(newState.players[0]?.property_owns).toEqual([2, 4]);
    });

    it('should only modify specified player', () => {
      const newState = GameStateManager.changePlayerInfo(
        mockGameState,
        { player_money: 1000 },
        0
      );

      expect(newState.players[0]?.player_money).toBe(1000);
      expect(newState.players[1]?.player_money).toBe(1500);
    });

    it('should not modify original state', () => {
      const originalMoney = mockGameState.players[0]!.player_money;
      GameStateManager.changePlayerInfo(
        mockGameState,
        { player_money: 500 },
        0
      );

      expect(mockGameState.players[0]?.player_money).toBe(originalMoney);
    });
  });

  describe('setCurrentTile', () => {
    it('should set currentTile for unowned property', () => {
      const cell: FlattenedCell = {
        index: 3,
        name: 'Test Property',
        cell_type: 'property',
        board_id: 'test_board',
        board_versions: ['1.0'],
        property_price: 200,
        house_rent: new Map([['0', 10], ['1', 20]]),
        house_price: 50,
      };

      const newState = GameStateManager.setCurrentTile(mockGameState, cell);

      expect(newState.currentTile).toBeDefined();
      expect(newState.currentTile?.index).toBe(3);
      expect(newState.currentTile?.type).toBe('property');
      expect(newState.currentTile?.isOwned).toBe(false);
      expect(newState.currentTile?.price).toBe(200);
    });

    it('should set currentTile for owned property', () => {
      mockGameState.players[1]!.property_owns = [3];
      const cell: FlattenedCell = {
        index: 3,
        name: 'Test Property',
        cell_type: 'property',
        board_id: 'test_board',
        board_versions: ['1.0'],
        property_price: 200,
        house_rent: new Map([['0', 10], ['1', 20]]),
        house_price: 50,
      };

      const newState = GameStateManager.setCurrentTile(mockGameState, cell);

      expect(newState.currentTile?.isOwned).toBe(true);
      expect(newState.currentTile?.ownerId).toBe('player-2');
      expect(newState.currentTile?.isOwnerCurrentPlayer).toBe(false);
    });

    it('should set isOwnerCurrentPlayer correctly when current player owns tile', () => {
      mockGameState.players[0]!.property_owns = [3];
      mockGameState.turn.currentPlayerIndex = 0;
      const cell: FlattenedCell = {
        index: 3,
        name: 'Test Property',
        cell_type: 'property',
        board_id: 'test_board',
        board_versions: ['1.0'],
        property_price: 200,
        house_rent: new Map([['0', 10], ['1', 20]]),
        house_price: 50,
      };

      const newState = GameStateManager.setCurrentTile(mockGameState, cell);

      expect(newState.currentTile?.isOwned).toBe(true);
      expect(newState.currentTile?.isOwnerCurrentPlayer).toBe(true);
    });

    it('should handle transport tiles', () => {
      const cell: FlattenedCell = {
        index: 5,
        name: 'Test Station',
        cell_type: 'transport',
        board_id: 'test_board',
        board_versions: ['1.0'],
        transport_price: 200,
        transport_rent: new Map([['1', 25], ['2', 50], ['3', 100], ['4', 200]]),
      };

      const newState = GameStateManager.setCurrentTile(mockGameState, cell);

      expect(newState.currentTile?.type).toBe('transport');
      expect(newState.currentTile?.price).toBe(200);
    });

    it('should handle utility tiles', () => {
      const cell: FlattenedCell = {
        index: 12,
        name: 'Test Utility',
        cell_type: 'utility',
        board_id: 'test_board',
        board_versions: ['1.0'],
        utility_price: 150,
        utility_rent_multiplier: new Map([['1', 4], ['2', 10]]),
      };

      const newState = GameStateManager.setCurrentTile(mockGameState, cell);

      expect(newState.currentTile?.type).toBe('utility');
      expect(newState.currentTile?.price).toBe(150);
    });

    it('should detect owned transport', () => {
      mockGameState.players[1]!.transport_owns = [5];
      const cell: FlattenedCell = {
        index: 5,
        name: 'Test Station',
        cell_type: 'transport',
        board_id: 'test_board',
        board_versions: ['1.0'],
        transport_price: 200,
        transport_rent: new Map([['1', 25], ['2', 50], ['3', 100], ['4', 200]]),
      };

      const newState = GameStateManager.setCurrentTile(mockGameState, cell);

      expect(newState.currentTile?.isOwned).toBe(true);
      expect(newState.currentTile?.ownerId).toBe('player-2');
    });

    it('should detect owned utility', () => {
      mockGameState.players[0]!.utility_owns = [12];
      const cell: FlattenedCell = {
        index: 12,
        name: 'Test Utility',
        cell_type: 'utility',
        board_id: 'test_board',
        board_versions: ['1.0'],
        utility_price: 150,
        utility_rent_multiplier: new Map([['1', 4], ['2', 10]]),
      };

      const newState = GameStateManager.setCurrentTile(mockGameState, cell);

      expect(newState.currentTile?.isOwned).toBe(true);
      expect(newState.currentTile?.ownerId).toBe('player-1');
    });
  });
});

