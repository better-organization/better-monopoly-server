import { GameService } from '../../../src/services/gameService';
import { RoomService } from '../../../src/services/roomService';
import { BoardService } from '../../../src/services/boardService';
import { Game } from '../../../src/models/Game';

// Mock RoomService and BoardService
jest.mock('../../../src/services/roomService');
jest.mock('../../../src/services/boardService');

describe('GameService', () => {
    let gameService: GameService;
    let mockRoomService: jest.Mocked<RoomService>;
    let mockBoardService: jest.Mocked<typeof BoardService>;

    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        jest.clearAllMocks();

        // Get singleton instance
        gameService = GameService.getInstance();

        // Clear all games before each test
        gameService.clearAllGames();

        // Clear all cached boards before each test
        gameService.clearAllBoards();

        // Setup mock RoomService
        mockRoomService = {
            getRoom: jest.fn(),
        } as any;

        (RoomService.getInstance as jest.Mock).mockReturnValue(mockRoomService);

        // Setup mock BoardService
        mockBoardService = BoardService as jest.Mocked<typeof BoardService>;
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

        it('should create game with default game number 1', () => {
            const roomId = 'room-123';
            const playerIds = ['host-456'];

            const game = gameService.createGame(roomId, playerIds);

            expect(game.gameId).toBe(`${roomId}-g1`);
        });

        it('should create game with custom game number', () => {
            const roomId = 'room-123';
            const playerIds = ['host-456'];

            const game = gameService.createGame(roomId, playerIds, 3);

            expect(game.gameId).toBe(`${roomId}-g3`);
        });

        it('should create game with multiple players', () => {
            const playerIds = ['host-456', 'player-2', 'player-3'];
            const game = gameService.createGame('room-123', playerIds);

            expect(game.maxPlayers).toBe(3);
            expect(game.gameState.players).toHaveLength(3);
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
            game.gameState.players[0]!.position = 5;

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

    describe('getBoardInfo', () => {
        it('should return board info when game exists', () => {
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

            const boardInfo = gameService.getBoardInfo(roomCode);

            expect(boardInfo).toBeDefined();
            expect(boardInfo?.boardId).toBe('european_football_club_giants');
            expect(boardInfo?.version).toBe('1.0');
        });

        it('should return null when game does not exist', () => {
            mockRoomService.getRoom.mockReturnValue(undefined);

            const boardInfo = gameService.getBoardInfo('invalid-code');

            expect(boardInfo).toBeNull();
        });

        it('should return null when room exists but game does not', () => {
            mockRoomService.getRoom.mockReturnValue({
                roomId: 'room-123',
                roomCode: '123456',
                players: [],
                maxPlayers: 4,
                roomState: "WAITING",
            });

            const boardInfo = gameService.getBoardInfo('123456');

            expect(boardInfo).toBeNull();
        });

        it('should return board info with correct structure', () => {
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

            const boardInfo = gameService.getBoardInfo(roomCode);

            expect(boardInfo).toHaveProperty('boardId');
            expect(boardInfo).toHaveProperty('version');
            expect(typeof boardInfo?.boardId).toBe('string');
            expect(typeof boardInfo?.version).toBe('string');
        });
    });

    describe('getBoard', () => {
        it('should return board when game exists', async () => {
            const roomId = 'room-123';
            const roomCode = '123456';

            mockRoomService.getRoom.mockReturnValue({
                roomId,
                roomCode,
                players: [],
                maxPlayers: 4,
                roomState: "WAITING",
            });

            const mockBoard = {
                id: 'european_football_club_giants',
                version: '1.0',
                edition: 'European Football Club Giants',
                cells: [],
            };

            mockBoardService.getBoardLayout = jest.fn().mockResolvedValue(mockBoard);

            gameService.createGame(roomId, ['host-456']);

            const board = await gameService.getBoard(roomCode);

            expect(board).toBeDefined();
            expect(board?.id).toBe('european_football_club_giants');
            expect(board?.version).toBe('1.0');
            expect(mockBoardService.getBoardLayout).toHaveBeenCalledWith(
                'european_football_club_giants',
                '1.0'
            );
        });

        it('should return null when game does not exist', async () => {
            mockRoomService.getRoom.mockReturnValue(undefined);

            const board = await gameService.getBoard('invalid-code');

            expect(board).toBeNull();
            expect(mockBoardService.getBoardLayout).not.toHaveBeenCalled();
        });

        it('should return null when room exists but game does not', async () => {
            mockRoomService.getRoom.mockReturnValue({
                roomId: 'room-123',
                roomCode: '123456',
                players: [],
                maxPlayers: 4,
                roomState: "WAITING",
            });

            const board = await gameService.getBoard('123456');

            expect(board).toBeNull();
            expect(mockBoardService.getBoardLayout).not.toHaveBeenCalled();
        });

        it('should return board from BoardService with correct parameters', async () => {
            const roomId = 'room-123';
            const roomCode = '123456';

            mockRoomService.getRoom.mockReturnValue({
                roomId,
                roomCode,
                players: [],
                maxPlayers: 4,
                roomState: "WAITING",
            });

            const mockBoard = {
                id: 'european_football_club_giants',
                version: '1.0',
                cells: [{ index: 1, name: 'Cell 1' }],
            };

            mockBoardService.getBoardLayout = jest.fn().mockResolvedValue(mockBoard);

            gameService.createGame(roomId, ['host-456']);

            const board = await gameService.getBoard(roomCode);

            expect(board).toEqual(mockBoard);
            expect(mockBoardService.getBoardLayout).toHaveBeenCalledTimes(1);
        });

        it('should return null when BoardService returns null', async () => {
            const roomId = 'room-123';
            const roomCode = '123456';

            mockRoomService.getRoom.mockReturnValue({
                roomId,
                roomCode,
                players: [],
                maxPlayers: 4,
                roomState: "WAITING",
            });

            mockBoardService.getBoardLayout = jest.fn().mockResolvedValue(null);

            gameService.createGame(roomId, ['host-456']);

            const board = await gameService.getBoard(roomCode);

            expect(board).toBeNull();
        });

        // Caching tests
        it('should cache board after first retrieval and not call BoardService again', async () => {
            const roomId = 'room-123';
            const roomCode = '123456';

            mockRoomService.getRoom.mockReturnValue({
                roomId,
                roomCode,
                players: [],
                maxPlayers: 4,
                roomState: "WAITING",
            });

            const mockBoard = {
                id: 'european_football_club_giants',
                version: '1.0',
                edition: 'European Football Club Giants',
                cells: [{ index: 1, name: 'Cell 1' }],
            };

            mockBoardService.getBoardLayout = jest.fn().mockResolvedValue(mockBoard);

            gameService.createGame(roomId, ['host-456']);

            // First call - should fetch from BoardService
            const board1 = await gameService.getBoard(roomCode);
            expect(board1).toEqual(mockBoard);
            expect(mockBoardService.getBoardLayout).toHaveBeenCalledTimes(1);

            // Second call - should return cached board
            const board2 = await gameService.getBoard(roomCode);
            expect(board2).toEqual(mockBoard);
            expect(mockBoardService.getBoardLayout).toHaveBeenCalledTimes(1); // Still 1, not called again
        });

        it('should return same cached board instance on subsequent calls', async () => {
            const roomId = 'room-123';
            const roomCode = '123456';

            mockRoomService.getRoom.mockReturnValue({
                roomId,
                roomCode,
                players: [],
                maxPlayers: 4,
                roomState: "WAITING",
            });

            const mockBoard = {
                id: 'european_football_club_giants',
                version: '1.0',
                edition: 'European Football Club Giants',
                cells: [],
            };

            mockBoardService.getBoardLayout = jest.fn().mockResolvedValue(mockBoard);

            gameService.createGame(roomId, ['host-456']);

            const board1 = await gameService.getBoard(roomCode);
            const board2 = await gameService.getBoard(roomCode);

            // Should be the exact same instance
            expect(board1).toBe(board2);
        });

        it('should share cached board across different games with same boardId and version', async () => {
            const roomId1 = 'room-123';
            const roomCode1 = '123456';
            const roomId2 = 'room-456';
            const roomCode2 = '654321';

            // Setup first game
            mockRoomService.getRoom.mockImplementation((code: string) => {
                if (code === roomCode1) {
                    return {
                        roomId: roomId1,
                        roomCode: roomCode1,
                        players: [],
                        maxPlayers: 4,
                        roomState: "WAITING",
                    };
                } else if (code === roomCode2) {
                    return {
                        roomId: roomId2,
                        roomCode: roomCode2,
                        players: [],
                        maxPlayers: 4,
                        roomState: "WAITING",
                    };
                }
                return undefined;
            });

            const mockBoard = {
                id: 'european_football_club_giants',
                version: '1.0',
                edition: 'European Football Club Giants',
                cells: [],
            };

            mockBoardService.getBoardLayout = jest.fn().mockResolvedValue(mockBoard);

            gameService.createGame(roomId1, ['host-1']);
            gameService.createGame(roomId2, ['host-2']);

            // First game gets board
            const board1 = await gameService.getBoard(roomCode1);
            expect(mockBoardService.getBoardLayout).toHaveBeenCalledTimes(1);

            // Second game should use cached board
            const board2 = await gameService.getBoard(roomCode2);
            expect(mockBoardService.getBoardLayout).toHaveBeenCalledTimes(1); // Still 1
            expect(board1).toBe(board2); // Same instance
        });

        it('should create separate cache entries for different boardId/version combinations', async () => {
            const roomId1 = 'room-123';
            const roomCode1 = '123456';

            mockRoomService.getRoom.mockReturnValue({
                roomId: roomId1,
                roomCode: roomCode1,
                players: [],
                maxPlayers: 4,
                roomState: "WAITING",
            });

            const mockBoard1 = {
                id: 'european_football_club_giants',
                version: '1.0',
                edition: 'European Football Club Giants',
                cells: [],
            };

            const mockBoard2 = {
                id: 'european_football_club_giants',
                version: '2.0',
                edition: 'European Football Club Giants v2',
                cells: [],
            };

            mockBoardService.getBoardLayout = jest.fn()
                .mockResolvedValueOnce(mockBoard1)
                .mockResolvedValueOnce(mockBoard2);

            // Create game with version 1.0
            const game1 = gameService.createGame(roomId1, ['host-1']);
            const board1 = await gameService.getBoard(roomCode1);
            expect(board1?.version).toBe('1.0');
            expect(mockBoardService.getBoardLayout).toHaveBeenCalledTimes(1);

            // Manually change game's board version to 2.0 for testing
            game1.gameSettings.board = 'european_football_club_giants';
            game1.gameSettings.version = '2.0';

            // Get board with different version
            const board2 = await gameService.getBoard(roomCode1);
            expect(board2?.version).toBe('2.0');
            expect(mockBoardService.getBoardLayout).toHaveBeenCalledTimes(2); // Called twice for different versions
            expect(board1).not.toBe(board2); // Different instances
        });

        it('should persist cached boards across multiple getBoard calls from different room codes', async () => {
            const roomId1 = 'room-123';
            const roomCode1 = '123456';
            const roomId2 = 'room-456';
            const roomCode2 = '654321';
            const roomId3 = 'room-789';
            const roomCode3 = '987654';

            mockRoomService.getRoom.mockImplementation((code: string) => {
                const roomMap: Record<string, any> = {
                    [roomCode1]: { roomId: roomId1, roomCode: roomCode1, players: [], maxPlayers: 4, roomState: "WAITING" },
                    [roomCode2]: { roomId: roomId2, roomCode: roomCode2, players: [], maxPlayers: 4, roomState: "WAITING" },
                    [roomCode3]: { roomId: roomId3, roomCode: roomCode3, players: [], maxPlayers: 4, roomState: "WAITING" },
                };
                return roomMap[code];
            });

            const mockBoard = {
                id: 'european_football_club_giants',
                version: '1.0',
                edition: 'European Football Club Giants',
                cells: [],
            };

            mockBoardService.getBoardLayout = jest.fn().mockResolvedValue(mockBoard);

            gameService.createGame(roomId1, ['host-1']);
            gameService.createGame(roomId2, ['host-2']);
            gameService.createGame(roomId3, ['host-3']);

            // First call caches the board
            const board1 = await gameService.getBoard(roomCode1);
            expect(mockBoardService.getBoardLayout).toHaveBeenCalledTimes(1);

            // Subsequent calls from different rooms should use cache
            const board2 = await gameService.getBoard(roomCode2);
            const board3 = await gameService.getBoard(roomCode3);

            expect(mockBoardService.getBoardLayout).toHaveBeenCalledTimes(1); // Still 1
            expect(board1).toBe(board2);
            expect(board2).toBe(board3);
        });

        it('should not cache when BoardService returns null', async () => {
            const roomId = 'room-123';
            const roomCode = '123456';

            mockRoomService.getRoom.mockReturnValue({
                roomId,
                roomCode,
                players: [],
                maxPlayers: 4,
                roomState: "WAITING",
            });

            // First call returns null
            mockBoardService.getBoardLayout = jest.fn().mockResolvedValue(null);

            gameService.createGame(roomId, ['host-456']);

            const board1 = await gameService.getBoard(roomCode);
            expect(board1).toBeNull();
            expect(mockBoardService.getBoardLayout).toHaveBeenCalledTimes(1);

            // Second call should try BoardService again (not cached)
            const board2 = await gameService.getBoard(roomCode);
            expect(board2).toBeNull();
            expect(mockBoardService.getBoardLayout).toHaveBeenCalledTimes(2); // Called again
        });

        it('should use correct cache key format (boardId + version)', async () => {
            const roomId = 'room-123';
            const roomCode = '123456';

            mockRoomService.getRoom.mockReturnValue({
                roomId,
                roomCode,
                players: [],
                maxPlayers: 4,
                roomState: "WAITING",
            });

            const mockBoard = {
                id: 'test_board',
                version: '1.5',
                edition: 'Test Board',
                cells: [],
            };

            mockBoardService.getBoardLayout = jest.fn().mockResolvedValue(mockBoard);

            const game = gameService.createGame(roomId, ['host-456']);
            game.gameSettings.board = 'test_board';
            game.gameSettings.version = '1.5';

            await gameService.getBoard(roomCode);

            // Verify BoardService was called with correct parameters
            expect(mockBoardService.getBoardLayout).toHaveBeenCalledWith('test_board', '1.5');
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

            gameService.createGame(roomId, ['host-456']);

            const result = gameService.rollDice(roomCode, "host-456");

            expect(result).toBeDefined();
            expect(result?.dice).toHaveLength(2);
            expect(result?.total).toBeGreaterThanOrEqual(2);
            expect(result?.total).toBeLessThanOrEqual(12);
            expect(result!.newPosition).toBe(result!.total);
            expect(result).toHaveProperty('double');
            expect(typeof result!.double).toBe('boolean');
        });

        it('should include double property in dice roll result', () => {
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

            const result = gameService.rollDice(roomCode, "host-456");

            expect(result).toHaveProperty('double');
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

    describe('clearAllBoards', () => {
        it('should clear all cached boards', async () => {
            const roomId = 'room-123';
            const roomCode = '123456';

            mockRoomService.getRoom.mockReturnValue({
                roomId,
                roomCode,
                players: [],
                maxPlayers: 4,
                roomState: "WAITING",
            });

            const mockBoard = {
                id: 'european_football_club_giants',
                version: '1.0',
                edition: 'European Football Club Giants',
                cells: [],
            };

            mockBoardService.getBoardLayout = jest.fn().mockResolvedValue(mockBoard);

            gameService.createGame(roomId, ['host-456']);

            // First call caches the board
            await gameService.getBoard(roomCode);
            expect(mockBoardService.getBoardLayout).toHaveBeenCalledTimes(1);

            // Second call uses cache
            await gameService.getBoard(roomCode);
            expect(mockBoardService.getBoardLayout).toHaveBeenCalledTimes(1);

            // Clear boards cache
            gameService.clearAllBoards();

            // Third call should fetch again since cache was cleared
            await gameService.getBoard(roomCode);
            expect(mockBoardService.getBoardLayout).toHaveBeenCalledTimes(2);
        });

        it('should not affect games when clearing boards', async () => {
            const roomId = 'room-123';
            const roomCode = '123456';

            mockRoomService.getRoom.mockReturnValue({
                roomId,
                roomCode,
                players: [],
                maxPlayers: 4,
                roomState: "WAITING",
            });

            const mockBoard = {
                id: 'european_football_club_giants',
                version: '1.0',
                edition: 'European Football Club Giants',
                cells: [],
            };

            mockBoardService.getBoardLayout = jest.fn().mockResolvedValue(mockBoard);

            gameService.createGame(roomId, ['host-456']);
            await gameService.getBoard(roomCode);

            // Clear boards cache
            gameService.clearAllBoards();

            // Games should still exist
            expect(gameService.getAllGames()).toHaveLength(1);
            expect(gameService.getGame(roomId)).toBeDefined();
        });
    });

    describe('endTurn', () => {
        it('should end turn successfully for current player', () => {
            const roomId = 'room-123';
            const roomCode = '123456';
            const playerId = 'host-456';

            mockRoomService.getRoom.mockReturnValue({
                roomId,
                roomCode,
                players: [playerId, 'player-2'],
                maxPlayers: 2,
                roomState: "PLAYING",
            });

            gameService.createGame(roomId, [playerId, 'player-2']);

            // Roll dice first to move to END_TURN phase
            gameService.rollDice(roomCode, playerId);

            const result = gameService.endTurn(roomCode, playerId);

            expect(result).toBe(true);
        });

        it('should return false when game does not exist', () => {
            mockRoomService.getRoom.mockReturnValue(undefined);

            const result = gameService.endTurn('invalid-code', 'player-1');

            expect(result).toBe(false);
        });

        it('should return false when room is not found', () => {
            mockRoomService.getRoom.mockReturnValue(undefined);

            const result = gameService.endTurn('non-existent-room', 'player-1');

            expect(result).toBe(false);
        });

        it('should advance to next player after ending turn', () => {
            const roomId = 'room-123';
            const roomCode = '123456';
            const player1 = 'host-456';
            const player2 = 'player-789';

            mockRoomService.getRoom.mockReturnValue({
                roomId,
                roomCode,
                players: [player1, player2],
                maxPlayers: 2,
                roomState: "PLAYING",
            });

            gameService.createGame(roomId, [player1, player2]);

            // Player 1 rolls dice and ends turn
            gameService.rollDice(roomCode, player1);
            gameService.endTurn(roomCode, player1);

            const gameState = gameService.getGameState(roomCode);
            expect(gameState?.turn.currentPlayerIndex).toBe(1);
        });

        it('should handle multiple players turn rotation', () => {
            const roomId = 'room-123';
            const roomCode = '123456';
            const player1 = 'player-1';
            const player2 = 'player-2';
            const player3 = 'player-3';

            mockRoomService.getRoom.mockReturnValue({
                roomId,
                roomCode,
                players: [player1, player2, player3],
                maxPlayers: 3,
                roomState: "PLAYING",
            });

            gameService.createGame(roomId, [player1, player2, player3]);

            // Player 1's turn
            gameService.rollDice(roomCode, player1);
            gameService.endTurn(roomCode, player1);

            let gameState = gameService.getGameState(roomCode);
            expect(gameState?.turn.currentPlayerIndex).toBe(1);

            // Player 2's turn
            gameService.rollDice(roomCode, player2);
            gameService.endTurn(roomCode, player2);

            gameState = gameService.getGameState(roomCode);
            expect(gameState?.turn.currentPlayerIndex).toBe(2);

            // Player 3's turn
            gameService.rollDice(roomCode, player3);
            gameService.endTurn(roomCode, player3);

            // Should wrap back to player 1
            gameState = gameService.getGameState(roomCode);
            expect(gameState?.turn.currentPlayerIndex).toBe(0);
        });

        it('should increment round when completing full turn cycle', () => {
            const roomId = 'room-123';
            const roomCode = '123456';
            const player1 = 'player-1';
            const player2 = 'player-2';

            mockRoomService.getRoom.mockReturnValue({
                roomId,
                roomCode,
                players: [player1, player2],
                maxPlayers: 2,
                roomState: "PLAYING",
            });

            gameService.createGame(roomId, [player1, player2]);

            const initialRound = gameService.getGameState(roomCode)?.turn.round;

            // Complete one full round
            gameService.rollDice(roomCode, player1);
            gameService.endTurn(roomCode, player1);
            gameService.rollDice(roomCode, player2);
            gameService.endTurn(roomCode, player2);

            const gameState = gameService.getGameState(roomCode);
            expect(gameState?.turn.round).toBe(initialRound! + 1);
        });

        it('should reset phase to ROLL_DICE after ending turn', () => {
            const roomId = 'room-123';
            const roomCode = '123456';
            const playerId = 'host-456';

            mockRoomService.getRoom.mockReturnValue({
                roomId,
                roomCode,
                players: [playerId, 'player-2'],
                maxPlayers: 2,
                roomState: "PLAYING",
            });

            gameService.createGame(roomId, [playerId, 'player-2']);

            gameService.rollDice(roomCode, playerId);
            gameService.endTurn(roomCode, playerId);

            const gameState = gameService.getGameState(roomCode);
            expect(gameState?.phase).toBe('ROLL_DICE');
        });

        it('should throw error when trying to end turn out of turn', () => {
            const roomId = 'room-123';
            const roomCode = '123456';
            const player1 = 'player-1';
            const player2 = 'player-2';

            mockRoomService.getRoom.mockReturnValue({
                roomId,
                roomCode,
                players: [player1, player2],
                maxPlayers: 2,
                roomState: "PLAYING",
            });

            gameService.createGame(roomId, [player1, player2]);

            // Try to end turn when it's player 1's turn, but player 2 tries
            expect(() => {
                gameService.endTurn(roomCode, player2);
            }).toThrow();
        });

        it('should throw error when trying to end turn in wrong phase', () => {
            const roomId = 'room-123';
            const roomCode = '123456';
            const playerId = 'player-1';

            mockRoomService.getRoom.mockReturnValue({
                roomId,
                roomCode,
                players: [playerId, 'player-2'],
                maxPlayers: 2,
                roomState: "PLAYING",
            });

            gameService.createGame(roomId, [playerId, 'player-2']);

            // Try to end turn without rolling dice first
            expect(() => {
                gameService.endTurn(roomCode, playerId);
            }).toThrow();
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
            game.gameState.players.push({
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
