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
            expect(game.hostId).toBe(mockPlayerIds[0]);
            expect(game.players).toHaveLength(2);
            expect(game.currentPlayer).toBe(0);
            expect(game.status).toBe('waiting');
            expect(game.maxPlayers).toBe(2);
            expect(game.gameSettings).toEqual(DEFAULT_GAME_SETTINGS);
            expect(game.createdAt).toBeInstanceOf(Date);
            expect(game.updatedAt).toBeInstanceOf(Date);
        });

        it('should initialize players with correct values', () => {
            expect(game.players[0]).toEqual({
                user_id: mockPlayerIds[0],
                player_turn: 1,
                position: 0,
                player_money: 1500,
                property_owns: [],
                utility_owns: [],
                transport_owns: [],
            });
            expect(game.players[1]).toEqual({
                user_id: mockPlayerIds[1],
                player_turn: 2,
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
            const state = game.getState();
            expect(state.players).toHaveLength(2);
            expect(state.players[0]).toEqual({
                user_id: mockPlayerIds[0],
                player_turn: 1,
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

            const state = game.getState();

            expect(state.players).toHaveLength(2);
            expect(state.players[0]).toEqual({
                user_id: mockPlayerIds[0],
                player_turn: 1,
                position: 5,
                player_money: 1500,
                property_owns: [],
                utility_owns: [],
                transport_owns: [],
            });
            expect(state.players[1]).toEqual({
                user_id: mockPlayerIds[1],
                player_turn: 2,
                position: 10,
                player_money: 1200,
                property_owns: ['property1'],
                utility_owns: ['utility1'],
                transport_owns: ['transport1'],
            });
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
            }).toThrow('Player not found');
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
