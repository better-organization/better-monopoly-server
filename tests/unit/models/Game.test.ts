import { Game, DEFAULT_GAME_SETTINGS } from '../../../src/models/Game';

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
            expect(game.players).toHaveLength(2);
            expect(game.currentPlayer).toBe(0);
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
            expect(game.players[0]).toEqual({
                player_id: mockPlayerIds[0],
                player_turn: 0,
                position: 0,
                player_money: 1500,
                property_owns: [],
                utility_owns: [],
                transport_owns: [],
            });
            expect(game.players[1]).toEqual({
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
    });

    describe('getState', () => {
        it('should return players array with initialized players', () => {
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

        it('should return correct game state after modifying player data', () => {
            // Modify existing player data
            game.players[0]!.position = 5;
            game.players[1]!.position = 10;
            game.players[1]!.player_money = 1200;
            game.players[1]!.property_owns = ['property1'];
            game.players[1]!.utility_owns = ['utility1'];
            game.players[1]!.transport_owns = ['transport1'];

            const state = game.getGameState();

            expect(state.players).toHaveLength(2);
            expect(state.players[0]).toEqual({
                player_id: mockPlayerIds[0],
                player_turn: 0,
                position: 5,
                player_money: 1500,
                property_owns: [],
                utility_owns: [],
                transport_owns: [],
            });
            expect(state.players[1]).toEqual({
                player_id: mockPlayerIds[1],
                player_turn: 1,
                position: 10,
                player_money: 1200,
                property_owns: ['property1'],
                utility_owns: ['utility1'],
                transport_owns: ['transport1'],
            });
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

    describe('updatePlayerPosition', () => {
        // Players are already initialized in the main beforeEach

        it('should update player position correctly', () => {
            const newPosition = game.updatePlayerPosition(mockPlayerIds[0]!, 7);
            expect(newPosition).toBe(7);
            expect(game.players[0]!.position).toBe(7);
        });

        it('should wrap around at position 40', () => {
            game.players[0]!.position = 38;
            const newPosition = game.updatePlayerPosition(mockPlayerIds[0]!, 5);
            expect(newPosition).toBe(3); // (38 + 5) % 40 = 3
            expect(game.players[0]!.position).toBe(3);
        });

        it('should handle exact wrap at 40', () => {
            game.players[0]!.position = 35;
            const newPosition = game.updatePlayerPosition(mockPlayerIds[0]!, 5);
            expect(newPosition).toBe(0); // (35 + 5) % 40 = 0
            expect(game.players[0]!.position).toBe(0);
        });

        it('should update updatedAt timestamp', () => {
            const oldTimestamp = game.updatedAt;
            // Wait a bit to ensure timestamp difference
            setTimeout(() => {
                game.updatePlayerPosition(mockPlayerIds[0]!, 5);
                expect(game.updatedAt.getTime()).toBeGreaterThan(oldTimestamp.getTime());
            }, 10);
        });

        it('should increment currentPlayer after position update', () => {
            expect(game.currentPlayer).toBe(0);
            game.updatePlayerPosition(mockPlayerIds[0]!, 5);
            expect(game.currentPlayer).toBe(1);
        });

        it('should wrap currentPlayer back to 0 after last player', () => {
            game.currentPlayer = 1;
            game.updatePlayerPosition(mockPlayerIds[1]!, 3);
            expect(game.currentPlayer).toBe(0);
        });

        it('should throw error when player not found', () => {
            expect(() => {
                game.updatePlayerPosition("nonexistent-player", 5);
            }).toThrow('Player not found');
        });
    });

    describe('rollDiceAndUpdatePosition', () => {
        // Players are already initialized in the main beforeEach

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
        });

        it('should update player position after rolling', () => {
            const result = game.rollDiceAndUpdatePosition(mockPlayerIds[0]!);
            expect(game.players[0]!.position).toBe(result.newPosition);
        });

      it('should say double true when both dice have same value', () => {
        const realFn = Game.diceResult;
        Game.diceResult = () => 2;
        const result = game.rollDiceAndUpdatePosition(mockPlayerIds[0]!);
        Game.diceResult = realFn;

        expect(result.dice[0]).toBe(2);
        expect(result.dice[1]).toBe(2);
        expect(result.double).toBe(true);

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

        it('should handle position wrap-around when rolling from high position', () => {
            game.players[0]!.position = 38;

            // Mock Math.random to return specific dice values
            const mockMath = Object.create(global.Math);
            mockMath.random = jest.fn()
                .mockReturnValueOnce(0.5) // First die: 4
                .mockReturnValueOnce(0.8); // Second die: 5
            global.Math = mockMath;

            const result = game.rollDiceAndUpdatePosition(mockPlayerIds[0]!);

            expect(result.total).toBe(9);
            expect(result.newPosition).toBe(7); // (38 + 9) % 40 = 7
            expect(game.players[0]!.position).toBe(7);
        });

        it('should throw error when player not found', () => {
            expect(() => {
                game.rollDiceAndUpdatePosition("nonexistent-player");
            }).toThrow('It\'s not the player\'s turn');
        });
    });

    describe('isPlayerTurn', () => {
        it('should return true for current player', () => {
            expect(game.currentPlayer).toBe(0);
            expect(game.isPlayerTurn(mockPlayerIds[0]!)).toBe(true);
        });

        it('should return false for non-current player', () => {
            expect(game.currentPlayer).toBe(0);
            expect(game.isPlayerTurn(mockPlayerIds[1]!)).toBe(false);
        });

        it('should return correct value after turn changes', () => {
            game.currentPlayer = 1;
            expect(game.isPlayerTurn(mockPlayerIds[0]!)).toBe(false);
            expect(game.isPlayerTurn(mockPlayerIds[1]!)).toBe(true);
        });

        it('should return false for non-existent player', () => {
            expect(game.isPlayerTurn('nonexistent-player')).toBe(false);
        });
    });

    describe('rollDice', () => {
        it('should return two dice values between 1 and 6', () => {
            const realFn = Game.diceResult;
            Game.diceResult = () => 2;
            const result = game.rollDice();

            expect(result.dice).toHaveLength(2);
            console.log(result);
            expect(result.dice[0]).toBeGreaterThanOrEqual(1);
            expect(result.dice[0]).toBeLessThanOrEqual(6);
            expect(result.dice[1]).toBeGreaterThanOrEqual(1);
            expect(result.dice[1]).toBeLessThanOrEqual(6);
            Game.diceResult = realFn;
        });

        it('should return correct total of dice', () => {
            const result = game.rollDice();
            expect(result.total).toBe(result.dice[0] + result.dice[1]);
        });

        it('should set double to true when dice values match', () => {
            const realFn = Game.diceResult;
            Game.diceResult = () => 4;

            const result = game.rollDice();

            expect(result.dice[0]).toBe(4);
            expect(result.dice[1]).toBe(4);
            expect(result.double).toBe(true);

            Game.diceResult = realFn;
        });

        it('should set double to false when dice values differ', () => {
            const realFn = Game.diceResult;
            let callCount = 0;
            Game.diceResult = () => {
                callCount++;
                return callCount === 1 ? 3 : 5;
            };

            const result = game.rollDice();

            expect(result.dice[0]).toBe(3);
            expect(result.dice[1]).toBe(5);
            expect(result.double).toBe(false);

            Game.diceResult = realFn;
        });

        it('should return values in expected structure', () => {
            const result = game.rollDice();

            expect(result).toHaveProperty('dice');
            expect(result).toHaveProperty('total');
            expect(result).toHaveProperty('double');
            expect(Array.isArray(result.dice)).toBe(true);
            expect(typeof result.total).toBe('number');
            expect(typeof result.double).toBe('boolean');
        });
    });

    describe('Multiple Players', () => {
        // Players are already initialized in the main beforeEach (2 players)

        it('should update only the specified player position', () => {
            game.updatePlayerPosition(mockPlayerIds[0]!, 5);

            expect(game.players[0]!.position).toBe(5);
            expect(game.players[1]!.position).toBe(0);
        });

        it('should allow different players to roll independently', () => {
            const result1 = game.rollDiceAndUpdatePosition(mockPlayerIds[0]!);
            const result2 = game.rollDiceAndUpdatePosition(mockPlayerIds[1]!);

            expect(game.players[0]!.position).toBe(result1.newPosition);
            expect(game.players[1]!.position).toBe(result2.newPosition);
        });
    });
});
