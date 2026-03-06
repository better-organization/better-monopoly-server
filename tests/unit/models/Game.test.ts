// filepath: /Users/akashdey/Workspace/Monopoly/better-monopoly-server/tests/unit/models/Game.test.ts
import { Game, DEFAULT_GAME_SETTINGS } from '../../../src/models/Game';
import { Phase, Action } from '../../../src/types/game';
import { GameStateManager } from '../../../src/services/GameStateManager';
import { Board, FlattenedCell } from '../../../src/models/Board';

// Helper function to create a mock board with 40 cells
function createMockBoard(): Board {
    const cells: FlattenedCell[] = [];
    for (let i = 0; i < 40; i++) {
        cells.push({
            index: i,
            name: `Cell ${i}`,
            cell_type: 'property',
            board_id: 'test_board',
            board_versions: ['1.0'],
        });
    }

    return {
        id: 'test_board',
        version: '1.0',
        edition: 'Test Edition',
        currency: 'USD',
        currency_symbol: '$',
        mortgage_percentage: '50',
        sell_percentage: '50',
        terms: {
            player: 'Player',
            property: 'Property',
            transport: 'Transport',
            utility: 'Utility',
            house: 'House',
            hotel: 'Hotel',
            property_rent: 'Rent',
            transport_rent: 'Fare',
            utility_rent: 'Fee',
            mortgage: 'Mortgage',
            passing_go: 'Passing Go',
            salary: 'Salary',
            jail: 'Jail',
            theft: 'Theft',
            parking: 'Free Parking',
            income_tax: 'Income Tax',
            luxury_tax: 'Luxury Tax',
            community_chest: 'Community Chest',
            chance: 'Chance',
        },
        cells,
    };
}

describe('Game Model', () => {
    let game: Game;
    let mockBoard: Board;
    const mockRoomId = 'test-room-123';
    const mockPlayerIds = ['host-456', 'player-789'];

    beforeEach(() => {
        game = new Game(mockRoomId, mockPlayerIds);
        mockBoard = createMockBoard();
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
            const result = game.rollDiceAndUpdatePosition(mockPlayerIds[0]!, mockBoard);

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
            const result = game.rollDiceAndUpdatePosition(mockPlayerIds[0]!, mockBoard);
            expect(game.gameState.players[0]!.position).toBe(result.newPosition);
        });

        it('should update lastDice in game state', () => {
            const result = game.rollDiceAndUpdatePosition(mockPlayerIds[0]!, mockBoard);
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

            const result = game.rollDiceAndUpdatePosition(mockPlayerIds[0]!, mockBoard, mockTimeService);
            expect(result.timestamp).toBe(mockDate);
            expect(mockTimeService.now).toHaveBeenCalled();
        });

        it('should throw error when it is not the player\'s turn', () => {
            expect(() => {
                game.rollDiceAndUpdatePosition(mockPlayerIds[1]!, mockBoard); // Player 1 trying to roll when it's player 0's turn
            }).toThrow("Not your turn");
        });

        it('should throw error when player not found', () => {
            expect(() => {
                game.rollDiceAndUpdatePosition("nonexistent-player", mockBoard);
            }).toThrow("Not your turn");
        });

        it('should change phase after rolling dice', () => {
            const initialPhase = game.gameState.phase;
            expect(initialPhase).toBe(Phase.ROLL_DICE);

            game.rollDiceAndUpdatePosition(mockPlayerIds[0]!, mockBoard);

            // After rolling, moving, and resolving, phase should have changed
            const finalPhase = game.gameState.phase;
            expect(finalPhase).not.toBe(Phase.ROLL_DICE);
        });

        it('should allow multiple players to take turns', () => {
            const result1 = game.rollDiceAndUpdatePosition(mockPlayerIds[0]!, mockBoard);
            expect(game.gameState.players[0]!.position).toBe(result1.newPosition);

            // After player 0's turn, it should be player 1's turn or game should handle it appropriately
            const player0Position = game.gameState.players[0]!.position;
            expect(player0Position).toBeGreaterThan(0);
        });

        it('should return rentEvent as undefined when landing on an unowned tile', () => {
            const result = game.rollDiceAndUpdatePosition(mockPlayerIds[0]!, mockBoard);
            expect(result.rentEvent).toBeUndefined();
        });
    });

    describe('rollDiceAndUpdatePosition — automatic rent', () => {

        function buildBoardWithOwnedCell(rentAmount: number): Board {
            const board = createMockBoard();
            board.cells[5] = {
                index: 5,
                name: 'Owned Property',
                cell_type: 'property',
                cell_sub_type: 'TEST',
                board_id: 'test_board',
                board_versions: ['1.0'],
                property_price: 100,
                house_rent: new Map([['0', rentAmount]]),
                house_price: 50,
            };
            return board;
        }

        beforeEach(() => {
            // Give player-789 ownership of cell index 5
            game['gameState'] = {
                ...game.gameState,
                players: [
                    { ...game.gameState.players[0]!, position: 0, player_money: 1500 },
                    { ...game.gameState.players[1]!, position: 0, player_money: 500, property_owns: [5] },
                ],
            };
        });

        it('should automatically deduct rent from payer and credit to owner', () => {
            const board = buildBoardWithOwnedCell(14);
            let result;
            let attempts = 0;
            do {
                game['gameState'] = {
                    ...game.gameState,
                    players: [
                        { ...game.gameState.players[0]!, position: 0, player_money: 1500 },
                        { ...game.gameState.players[1]!, position: 0, player_money: 500, property_owns: [5] },
                    ],
                    phase: Phase.ROLL_DICE,
                    allowedActions: [Action.ROLL_DICE],
                    currentTile: undefined,
                };
                result = game.rollDiceAndUpdatePosition(mockPlayerIds[0]!, board);
                attempts++;
            } while (result.newPosition !== 5 && attempts < 50);

            if (result.newPosition === 5) {
                expect(game.gameState.players[0]!.player_money).toBe(1500 - 14);
                expect(game.gameState.players[1]!.player_money).toBe(500 + 14);
            }
        });

        it('should include rentEvent in the dice roll response when landing on opponent tile', () => {
            const board = buildBoardWithOwnedCell(14);

            let result;
            let attempts = 0;
            do {
                game['gameState'] = {
                    ...game.gameState,
                    players: [
                        { ...game.gameState.players[0]!, position: 0, player_money: 1500 },
                        { ...game.gameState.players[1]!, position: 0, player_money: 500, property_owns: [5] },
                    ],
                    phase: Phase.ROLL_DICE,
                    allowedActions: [Action.ROLL_DICE],
                    currentTile: undefined,
                };
                result = game.rollDiceAndUpdatePosition(mockPlayerIds[0]!, board);
                attempts++;
            } while (result.newPosition !== 5 && attempts < 50);

            if (result.newPosition === 5) {
                expect(result.rentEvent).toBeDefined();
                expect(result.rentEvent!.payerId).toBe(mockPlayerIds[0]);
                expect(result.rentEvent!.ownerId).toBe(mockPlayerIds[1]);
                expect(result.rentEvent!.amount).toBe(14);
            }
        });

        it('should transition to END_TURN phase (not a separate PAY_RENT phase) after landing on opponent tile', () => {
            const board = buildBoardWithOwnedCell(14);

            let result;
            let attempts = 0;
            do {
                game['gameState'] = {
                    ...game.gameState,
                    players: [
                        { ...game.gameState.players[0]!, position: 0, player_money: 1500 },
                        { ...game.gameState.players[1]!, position: 0, player_money: 500, property_owns: [5] },
                    ],
                    phase: Phase.ROLL_DICE,
                    allowedActions: [Action.ROLL_DICE],
                    currentTile: undefined,
                };
                result = game.rollDiceAndUpdatePosition(mockPlayerIds[0]!, board);
                attempts++;
            } while (result.newPosition !== 5 && attempts < 50);

            if (result.newPosition === 5) {
                expect(game.gameState.phase).toBe(Phase.END_TURN);
            }
        });

        it('should NOT charge rent when landing on own property', () => {
            const board = buildBoardWithOwnedCell(14);

            // Give cell 5 to player-0 instead
            game['gameState'] = {
                ...game.gameState,
                players: [
                    { ...game.gameState.players[0]!, position: 0, player_money: 1500, property_owns: [5] },
                    { ...game.gameState.players[1]!, position: 0, player_money: 500, property_owns: [] },
                ],
                phase: Phase.ROLL_DICE,
                allowedActions: [Action.ROLL_DICE],
            };

            let result;
            let attempts = 0;
            do {
                game['gameState'] = {
                    ...game.gameState,
                    players: [
                        { ...game.gameState.players[0]!, position: 0 },
                        { ...game.gameState.players[1]!, position: 0 },
                    ],
                    phase: Phase.ROLL_DICE,
                    allowedActions: [Action.ROLL_DICE],
                    currentTile: undefined,
                };
                result = game.rollDiceAndUpdatePosition(mockPlayerIds[0]!, board);
                attempts++;
            } while (result.newPosition !== 5 && attempts < 50);

            if (result.newPosition === 5) {
                // No rent deducted
                expect(game.gameState.players[0]!.player_money).toBe(1500);
                expect(result.rentEvent).toBeUndefined();
            }
        });

        it('should throw if called out of turn', () => {
            expect(() =>
                game.rollDiceAndUpdatePosition(mockPlayerIds[1]!, buildBoardWithOwnedCell(14))
            ).toThrow('Not your turn');
        });

        it('should throw if called in the wrong phase', () => {
            // Manually set phase to END_TURN
            game['gameState'] = { ...game.gameState, phase: Phase.END_TURN, allowedActions: [Action.END_TURN] };
            expect(() =>
                game.rollDiceAndUpdatePosition(mockPlayerIds[0]!, buildBoardWithOwnedCell(14))
            ).toThrow('Action ROLL_DICE not allowed in phase END_TURN');
        });
    });

    describe('initializeGameState', () => {
        it('should create game state with correct structure', () => {
            const state = GameStateManager.initializeGameState(mockPlayerIds, DEFAULT_GAME_SETTINGS);

            expect(state.phase).toBe(Phase.ROLL_DICE);
            expect(state.players).toHaveLength(2);
            expect(state.turn.currentPlayerIndex).toBe(0);
            expect(state.turn.round).toBe(1);
            expect(state.allowedActions).toBeDefined();
        });
    });

    describe('initializePlayers', () => {
        it('should create players with correct initial values', () => {
            const players = GameStateManager.initializePlayers(mockPlayerIds, DEFAULT_GAME_SETTINGS);

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
            const players = GameStateManager.initializePlayers(mockPlayerIds, DEFAULT_GAME_SETTINGS);

            expect(players[0]!.player_turn).toBe(0);
            expect(players[1]!.player_turn).toBe(1);
        });

        it('should handle different player counts', () => {
            const threePlayerIds = ['p1', 'p2', 'p3'];
            const players = GameStateManager.initializePlayers(threePlayerIds, DEFAULT_GAME_SETTINGS);

            expect(players).toHaveLength(3);
            expect(players[2]!.player_turn).toBe(2);
        });
    });

    describe('endTurn', () => {
        beforeEach(() => {
            // Roll dice to move to END_TURN phase
            mockBoard.cells.forEach((cell) => {
                cell.cell_type = 'special';
            });
            game.rollDiceAndUpdatePosition(mockPlayerIds[0]!, mockBoard);
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
            game.rollDiceAndUpdatePosition(mockPlayerIds[1]!, mockBoard); // Player 1 rolls
            game.endTurn(mockPlayerIds[1]!); // Player 1 ends turn

            // Now it should be back to player 0
            expect(game.gameState.turn.currentPlayerIndex).toBe(0);
        });

        it('should increment round when wrapping to first player', () => {
            const initialRound = game.gameState.turn.round;

            // Complete round for both players
            game.endTurn(mockPlayerIds[0]!);
            game.rollDiceAndUpdatePosition(mockPlayerIds[1]!, mockBoard);
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
