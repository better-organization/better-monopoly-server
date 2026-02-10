// filepath: /Users/akashdey/Workspace/Monopoly/better-monopoly-server/tests/unit/models/Game.test.ts
import { Game, DEFAULT_GAME_SETTINGS } from '../../../src/models/Game';
import { Phase, Action } from '../../../src/types/game';

describe('Game Model', () => {
    let game: Game;
    const mockRoomId = 'test-room-123';
    const mockPlayerIds = ['host-456', 'player-789'];

    beforeEach(() => {
        game = new Game(mockRoomId, mockPlayerIds);
    });

    describe('Constructor', () => {
        it('should create a game with correct initial values', () => {
            expect(game.roomId).toBe(mockRoomId);
            expect(game.gameId).toBe(`${mockRoomId}-g1`);
            expect(game.hostId).toBe(mockPlayerIds[0]);
            expect(game.gameState.players).toHaveLength(2);
            expect(game.gameState.turn.currentPlayerIndex).toBe(0);
            expect(game.gameState.turn.round).toBe(1);
            expect(game.gameState.phase).toBe(Phase.ROLL_DICE);
            expect(game.status).toBe('waiting');
            expect(game.maxPlayers).toBe(2);
            expect(game.gameSettings).toEqual(DEFAULT_GAME_SETTINGS);
            expect(game.createdAt).toBeInstanceOf(Date);
            expect(game.updatedAt).toBeInstanceOf(Date);
        });

        it('should create gameId with custom game number', () => {
            const customGame = new Game(mockRoomId, mockPlayerIds, 3);
            expect(customGame.gameId).toBe(`${mockRoomId}-g3`);
        });

        it('should default to game number 1 if not provided', () => {
            const defaultGame = new Game(mockRoomId, mockPlayerIds);
            expect(defaultGame.gameId).toBe(`${mockRoomId}-g1`);
        });

        it('should initialize players with correct values', () => {
            expect(game.gameState.players[0]).toEqual({
                player_id: mockPlayerIds[0],
                player_turn: 0,
                position: 0,
                player_money: 1500,
                property_owns: [],
                utility_owns: [],
                transport_owns: [],
            });
            expect(game.gameState.players[1]).toEqual({
                player_id: mockPlayerIds[1],
                player_turn: 1,
                position: 0,
                player_money: 1500,
                property_owns: [],
                utility_owns: [],
                transport_owns: [],
            });
        });

        it('should initialize with default game settings', () => {
            expect(game.gameSettings.startingMoney).toBe(1500);
            expect(game.gameSettings.passGoMoney).toBe(200);
            expect(game.gameSettings.jailFine).toBe(50);
            expect(game.gameSettings.houseCost).toBe(100);
            expect(game.gameSettings.hotelCost).toBe(200);
        });

        it('should initialize gameState with allowed actions', () => {
            expect(game.gameState.allowedActions).toBeDefined();
            expect(Array.isArray(game.gameState.allowedActions)).toBe(true);
        });
    });

    describe('getGameState', () => {
        it('should return game state with initialized players', () => {
            const state = game.getGameState();
            expect(state.players).toHaveLength(2);
            expect(state.players[0]).toEqual({
                player_id: mockPlayerIds[0],
                player_turn: 0,
                position: 0,
                player_money: 1500,
                property_owns: [],
                utility_owns: [],
                transport_owns: [],
            });
        });

        it('should return a copy of game state (not direct reference)', () => {
            const state1 = game.getGameState();
            const state2 = game.getGameState();
            expect(state1).not.toBe(state2); // Different objects
            expect(state1).toEqual(state2); // But same content
        });

        it('should include phase and turn information', () => {
            const state = game.getGameState();
            expect(state.phase).toBe(Phase.ROLL_DICE);
            expect(state.turn.currentPlayerIndex).toBe(0);
            expect(state.turn.round).toBe(1);
        });

        it('should include allowed actions', () => {
            const state = game.getGameState();
            expect(state.allowedActions).toBeDefined();
            expect(Array.isArray(state.allowedActions)).toBe(true);
        });
    });

    describe('getBoardInfo', () => {
        it('should return board ID and version from game settings', () => {
            const boardInfo = game.getBoardInfo();

            expect(boardInfo).toBeDefined();
            expect(boardInfo.boardId).toBe('european_football_club_giants');
            expect(boardInfo.version).toBe('1.0');
        });

        it('should return correct structure', () => {
            const boardInfo = game.getBoardInfo();

            expect(boardInfo).toHaveProperty('boardId');
            expect(boardInfo).toHaveProperty('version');
            expect(typeof boardInfo.boardId).toBe('string');
            expect(typeof boardInfo.version).toBe('string');
        });

        it('should return board info that matches game settings', () => {
            const boardInfo = game.getBoardInfo();

            expect(boardInfo.boardId).toBe(game.gameSettings.board);
            expect(boardInfo.version).toBe(game.gameSettings.version);
        });
    });

    describe('rollDiceAndUpdatePosition', () => {
        it('should roll dice and return result with new position', () => {
            const result = game.rollDiceAndUpdatePosition(mockPlayerIds[0]!);

            expect(result.dice).toHaveLength(2);
            expect(result.dice[0]).toBeGreaterThanOrEqual(1);
            expect(result.dice[0]).toBeLessThanOrEqual(6);
            expect(result.dice[1]).toBeGreaterThanOrEqual(1);
            expect(result.dice[1]).toBeLessThanOrEqual(6);
            expect(result.total).toBe(result.dice[0] + result.dice[1]);
            expect(result.timestamp).toBeInstanceOf(Date);
            expect(result.newPosition).toBe(result.total);
            expect(typeof result.double).toBe('boolean');
        });

        it('should update player position in game state after rolling', () => {
            const result = game.rollDiceAndUpdatePosition(mockPlayerIds[0]!);
            expect(game.gameState.players[0]!.position).toBe(result.newPosition);
        });

        it('should update lastDice in game state', () => {
            const result = game.rollDiceAndUpdatePosition(mockPlayerIds[0]!);
            expect(game.gameState.lastDice).toBeDefined();
            expect(game.gameState.lastDice?.dice).toEqual(result.dice);
            expect(game.gameState.lastDice?.total).toBe(result.total);
            expect(game.gameState.lastDice?.double).toBe(result.double);
        });

        it('should use provided time service', () => {
            const mockDate = new Date('2024-01-01T00:00:00Z');
            const mockTimeService = {
                now: jest.fn().mockReturnValue(mockDate),
            };

            const result = game.rollDiceAndUpdatePosition(mockPlayerIds[0]!, mockTimeService);
            expect(result.timestamp).toBe(mockDate);
            expect(mockTimeService.now).toHaveBeenCalled();
        });

        it('should throw error when it is not the player\'s turn', () => {
            expect(() => {
                game.rollDiceAndUpdatePosition(mockPlayerIds[1]!); // Player 1 trying to roll when it's player 0's turn
            }).toThrow("Not your turn");
        });

        it('should throw error when player not found', () => {
            expect(() => {
                game.rollDiceAndUpdatePosition("nonexistent-player");
            }).toThrow("Not your turn");
        });

        it('should change phase after rolling dice', () => {
            const initialPhase = game.gameState.phase;
            expect(initialPhase).toBe(Phase.ROLL_DICE);

            game.rollDiceAndUpdatePosition(mockPlayerIds[0]!);

            // After rolling, moving, and resolving, phase should have changed
            const finalPhase = game.gameState.phase;
            expect(finalPhase).not.toBe(Phase.ROLL_DICE);
        });

        it('should allow multiple players to take turns', () => {
            const result1 = game.rollDiceAndUpdatePosition(mockPlayerIds[0]!);
            expect(game.gameState.players[0]!.position).toBe(result1.newPosition);

            // After player 0's turn, it should be player 1's turn or game should handle it appropriately
            const player0Position = game.gameState.players[0]!.position;
            expect(player0Position).toBeGreaterThan(0);
        });
    });

    describe('initializeGameState', () => {
        it('should create game state with correct structure', () => {
            const state = game.initializeGameState(mockPlayerIds);

            expect(state.phase).toBe(Phase.ROLL_DICE);
            expect(state.players).toHaveLength(2);
            expect(state.turn.currentPlayerIndex).toBe(0);
            expect(state.turn.round).toBe(1);
            expect(state.allowedActions).toBeDefined();
        });
    });

    describe('initializePlayers', () => {
        it('should create players with correct initial values', () => {
            const players = game.initializePlayers(mockPlayerIds);

            expect(players).toHaveLength(2);
            expect(players[0]!.player_id).toBe(mockPlayerIds[0]);
            expect(players[0]!.player_turn).toBe(0);
            expect(players[0]!.position).toBe(0);
            expect(players[0]!.player_money).toBe(1500);
            expect(players[0]!.property_owns).toEqual([]);
            expect(players[0]!.utility_owns).toEqual([]);
            expect(players[0]!.transport_owns).toEqual([]);
        });

        it('should assign correct turn order to players', () => {
            const players = game.initializePlayers(mockPlayerIds);

            expect(players[0]!.player_turn).toBe(0);
            expect(players[1]!.player_turn).toBe(1);
        });

        it('should handle different player counts', () => {
            const threePlayerIds = ['p1', 'p2', 'p3'];
            const players = game.initializePlayers(threePlayerIds);

            expect(players).toHaveLength(3);
            expect(players[2]!.player_turn).toBe(2);
        });
    });

    describe('endTurn', () => {
        beforeEach(() => {
            // Roll dice to move to END_TURN phase
            game.rollDiceAndUpdatePosition(mockPlayerIds[0]!);
        });

        it('should successfully end turn for current player', () => {
            const result = game.endTurn(mockPlayerIds[0]!);
            expect(result).toBe(true);
        });

        it('should advance to next player after ending turn', () => {
            const initialPlayerIndex = game.gameState.turn.currentPlayerIndex;
            game.endTurn(mockPlayerIds[0]!);

            const newPlayerIndex = game.gameState.turn.currentPlayerIndex;
            expect(newPlayerIndex).toBe((initialPlayerIndex + 1) % mockPlayerIds.length);
        });

        it('should reset phase to ROLL_DICE after ending turn', () => {
            game.endTurn(mockPlayerIds[0]!);
            expect(game.gameState.phase).toBe(Phase.ROLL_DICE);
        });

        it('should throw error when it is not the player\'s turn', () => {
            expect(() => {
                game.endTurn(mockPlayerIds[1]!); // Player 1 trying to end when it's player 0's turn
            }).toThrow('Not your turn');
        });

        it('should throw error when called in wrong phase', () => {
            // Create a new game (starts in ROLL_DICE phase)
            const newGame = new Game('test-room', mockPlayerIds);

            expect(() => {
                newGame.endTurn(mockPlayerIds[0]!);
            }).toThrow('Action END_TURN not allowed in phase ROLL_DICE');
        });

        it('should wrap to first player after last player', () => {
            // Get to player 2's turn (last player)
            game.endTurn(mockPlayerIds[0]!); // Player 0 ends turn
            game.rollDiceAndUpdatePosition(mockPlayerIds[1]!); // Player 1 rolls
            game.endTurn(mockPlayerIds[1]!); // Player 1 ends turn

            // Now it should be back to player 0
            expect(game.gameState.turn.currentPlayerIndex).toBe(0);
        });

        it('should increment round when wrapping to first player', () => {
            const initialRound = game.gameState.turn.round;

            // Complete round for both players
            game.endTurn(mockPlayerIds[0]!);
            game.rollDiceAndUpdatePosition(mockPlayerIds[1]!);
            game.endTurn(mockPlayerIds[1]!);

            expect(game.gameState.turn.round).toBe(initialRound + 1);
        });

        it('should not increment round when not wrapping to first player', () => {
            const initialRound = game.gameState.turn.round;

            game.endTurn(mockPlayerIds[0]!);

            expect(game.gameState.turn.round).toBe(initialRound);
        });

        it('should update allowed actions after ending turn', () => {
            game.endTurn(mockPlayerIds[0]!);

            // After ending turn, phase should be ROLL_DICE
            expect(game.gameState.phase).toBe(Phase.ROLL_DICE);
            expect(game.gameState.allowedActions).toContain(Action.ROLL_DICE);
        });
    });
});
