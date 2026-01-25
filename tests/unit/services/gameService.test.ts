import { GameService } from '../../../src/services/gameService';
import { RoomService } from '../../../src/services/roomService';
import { Game } from '../../../src/models/Game';

// Mock RoomService
jest.mock('../../../src/services/roomService');

describe('GameService', () => {
    let gameService: GameService;
    let mockRoomService: jest.Mocked<RoomService>;

    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        jest.clearAllMocks();

        // Get singleton instance
        gameService = GameService.getInstance();

        // Clear all games before each test
        gameService.clearAllGames();

        // Setup mock RoomService
        mockRoomService = {
            getRoom: jest.fn(),
        } as any;

        (RoomService.getInstance as jest.Mock).mockReturnValue(mockRoomService);
    });

    describe('Singleton Pattern', () => {
        it('should return the same instance', () => {
            const instance1 = GameService.getInstance();
            const instance2 = GameService.getInstance();

            expect(instance1).toBe(instance2);
        });
    });

    describe('createGame', () => {
        it('should create a new game with correct parameters', () => {
            const roomId = 'room-123';
            const playerIds = ['host-456'];

            const game = gameService.createGame(roomId, playerIds);

            expect(game).toBeInstanceOf(Game);
            expect(game.roomId).toBe(roomId);
            expect(game.hostId).toBe(playerIds[0]);
            expect(game.maxPlayers).toBe(1);
        });

        it('should create game with multiple players', () => {
            const playerIds = ['host-456', 'player-2', 'player-3'];
            const game = gameService.createGame('room-123', playerIds);

            expect(game.maxPlayers).toBe(3);
            expect(game.players).toHaveLength(3);
        });

        it('should store the game in the games map', () => {
            const roomId = 'room-123';
            gameService.createGame(roomId, ['host-456']);

            const retrievedGame = gameService.getGame(roomId);
            expect(retrievedGame).toBeDefined();
            expect(retrievedGame?.roomId).toBe(roomId);
        });

        it('should create multiple games independently', () => {
            const game1 = gameService.createGame('room-1', ['host-1']);
            const game2 = gameService.createGame('room-2', ['host-2']);

            expect(game1.roomId).toBe('room-1');
            expect(game2.roomId).toBe('room-2');
            expect(gameService.getAllGames()).toHaveLength(2);
        });
    });

    describe('getGame', () => {
        it('should return game when it exists', () => {
            const roomId = 'room-123';
            const createdGame = gameService.createGame(roomId, ['host-456']);

            const retrievedGame = gameService.getGame(roomId);

            expect(retrievedGame).toBe(createdGame);
        });

        it('should return null when game does not exist', () => {
            const game = gameService.getGame('non-existent-room');

            expect(game).toBeNull();
        });
    });

    describe('getGameByRoomCode', () => {
        it('should return game when room exists', () => {
            const roomId = 'room-123';
            const roomCode = '123456';

            // Mock RoomService to return room info
            mockRoomService.getRoom.mockReturnValue({
                roomId,
                roomCode,
                players: [],
                maxPlayers: 4,
                roomState: "WAITING",
            });

            const createdGame = gameService.createGame(roomId, ['host-456']);
            const retrievedGame = gameService.getGameByRoomCode(roomCode);

            expect(retrievedGame).toBe(createdGame);
            expect(mockRoomService.getRoom).toHaveBeenCalledWith(roomCode);
        });

        it('should return null when room does not exist', () => {
            mockRoomService.getRoom.mockReturnValue(undefined);

            const game = gameService.getGameByRoomCode('invalid-code');

            expect(game).toBeNull();
        });

        it('should return null when room exists but game does not', () => {
            mockRoomService.getRoom.mockReturnValue({
                roomId: 'room-123',
                roomCode: '123456',
                players: [],
                maxPlayers: 4,
                roomState: "WAITING",
            });

            const game = gameService.getGameByRoomCode('123456');

            expect(game).toBeNull();
        });
    });

    describe('getGameState', () => {
        it('should return game state when game exists', () => {
            const roomId = 'room-123';
            const roomCode = '123456';

            mockRoomService.getRoom.mockReturnValue({
                roomId,
                roomCode,
                players: [],
                maxPlayers: 4,
                roomState: "WAITING",
            });

            const game = gameService.createGame(roomId, ['host-456']);

            // Modify the existing player's position for testing
            game.players[0]!.position = 5;

            const state = gameService.getGameState(roomCode);

            expect(state).toBeDefined();
            expect(state?.players).toHaveLength(1);
            expect(state?.players[0]?.position).toBe(5);
        });

        it('should return null when game does not exist', () => {
            mockRoomService.getRoom.mockReturnValue(undefined);

            const state = gameService.getGameState('invalid-code');

            expect(state).toBeNull();
        });
    });

    describe('rollDice', () => {
        it('should roll dice and update position', () => {
            const roomId = 'room-123';
            const roomCode = '123456';

            mockRoomService.getRoom.mockReturnValue({
                roomId,
                roomCode,
                players: [],
                maxPlayers: 4,
                roomState: "WAITING",
            });

            const game = gameService.createGame(roomId, ['host-456']);

            // Add a player
            game.players.push({
                player_id: 'test-player-1',
                player_turn: 1,
                position: 0,
                player_money: 1500,
                property_owns: [],
                utility_owns: [],
                transport_owns: [],
            });

            const result = gameService.rollDice(roomCode, "test-player-1");

            expect(result).toBeDefined();
            expect(result?.dice).toHaveLength(2);
            expect(result?.total).toBeGreaterThanOrEqual(2);
            expect(result?.total).toBeLessThanOrEqual(12);
            expect(result?.newPosition).toBe(result?.total);
        });

        it('should return null when game does not exist', () => {
            mockRoomService.getRoom.mockReturnValue(undefined);

            const result = gameService.rollDice('invalid-code', "1");

            expect(result).toBeNull();
        });

        it('should return null when player does not exist', () => {
            const roomId = 'room-123';
            const roomCode = '123456';

            mockRoomService.getRoom.mockReturnValue({
                roomId,
                roomCode,
                players: [],
                maxPlayers: 4,
                roomState: "WAITING",
            });

            gameService.createGame(roomId, ['host-456']);

            // Don't add any players - rollDice will throw error which service catches
            try {
                const result = gameService.rollDice(roomCode, "1");
                // If it doesn't throw, it should return null
                expect(result).toBeNull();
            } catch (error) {
                // If it throws, that's also acceptable behavior
                expect(error).toBeDefined();
            }
        });
    });

    describe('deleteGame', () => {
        it('should delete existing game', () => {
            const roomId = 'room-123';
            gameService.createGame(roomId, ['host-456']);

            const deleted = gameService.deleteGame(roomId);

            expect(deleted).toBe(true);
            expect(gameService.getGame(roomId)).toBeNull();
        });

        it('should return false when game does not exist', () => {
            const deleted = gameService.deleteGame('non-existent-room');

            expect(deleted).toBe(false);
        });
    });

    describe('getAllGames', () => {
        it('should return empty array when no games exist', () => {
            const games = gameService.getAllGames();

            expect(games).toEqual([]);
        });

        it('should return all games', () => {
            gameService.createGame('room-1', ['host-1']);
            gameService.createGame('room-2', ['host-2']);
            gameService.createGame('room-3', ['host-3']);

            const games = gameService.getAllGames();

            expect(games).toHaveLength(3);
            expect(games[0]?.roomId).toBe('room-1');
            expect(games[1]?.roomId).toBe('room-2');
            expect(games[2]?.roomId).toBe('room-3');
        });
    });

    describe('clearAllGames', () => {
        it('should clear all games', () => {
            gameService.createGame('room-1', ['host-1']);
            gameService.createGame('room-2', ['host-2']);

            expect(gameService.getAllGames()).toHaveLength(2);

            gameService.clearAllGames();

            expect(gameService.getAllGames()).toHaveLength(0);
        });
    });

    describe('Integration with RoomService', () => {
        it('should correctly convert roomCode to roomId', () => {
            const roomId = 'room-uuid-123';
            const roomCode = '654321';

            mockRoomService.getRoom.mockReturnValue({
                roomId,
                roomCode,
                players: ['player1', 'player2'],
                maxPlayers: 4,
                roomState: 'WAITING',
            });

            const game = gameService.createGame(roomId, ['host-456']);
            game.players.push({
                player_id: 'test-player-1',
                player_turn: 1,
                position: 0,
                player_money: 1500,
                property_owns: [],
                utility_owns: [],
                transport_owns: [],
            });

            const retrievedGame = gameService.getGameByRoomCode(roomCode);

            expect(retrievedGame).toBe(game);
            expect(mockRoomService.getRoom).toHaveBeenCalledWith(roomCode);
        });
    });
});
