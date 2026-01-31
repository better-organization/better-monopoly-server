import { Request, Response } from 'express';
import { GameController } from '../../../src/controllers/gameController';
import { GameService } from '../../../src/services/gameService';
import { IUserTokenPayload } from '../../../src/utils/TokenUtil';

// Mock dependencies
jest.mock('../../../src/services/gameService');

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
    user?: IUserTokenPayload;
}

describe('GameController', () => {
    let mockGameService: jest.Mocked<GameService>;
    let mockRequest: Partial<AuthenticatedRequest>;
    let mockResponse: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Create mock service instance
        mockGameService = {
            getGameState: jest.fn(),
            rollDice: jest.fn(),
            getGame: jest.fn(),
            createGame: jest.fn(),
            deleteGame: jest.fn(),
            getAllGames: jest.fn(),
            clearAllGames: jest.fn(),
        } as unknown as jest.Mocked<GameService>;

        // Mock getInstance to return our mock service
        (GameService.getInstance as jest.Mock) = jest
            .fn()
            .mockReturnValue(mockGameService);

        // Setup mock response
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });

        mockResponse = {
            status: statusMock,
            json: jsonMock,
        };

        // Setup basic mock request with user and roomCode
        mockRequest = {
            user: {
                username: 'testUser',
                userId: 'user-123',
                roomCode: 'ABC123',
            },
            body: {},
            params: {},
        } as Partial<AuthenticatedRequest>;
    });

    describe('getGameState', () => {
        it('should return game state successfully', () => {
            const mockGameState = {
                current_turn: 0,
                players: [
                    {
                        player_id: 'player-1',
                        player_turn: 0,
                        position: 5,
                        player_money: 1500,
                        property_owns: [],
                        utility_owns: [],
                        transport_owns: [],
                    },
                    {
                        player_id: 'player-2',
                        player_turn: 1,
                        position: 10,
                        player_money: 1200,
                        property_owns: ['property1'],
                        utility_owns: [],
                        transport_owns: [],
                    },
                ],
            };

            mockGameService.getGameState = jest.fn().mockReturnValue(mockGameState);

            GameController.getGameState(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockGameService.getGameState).toHaveBeenCalledWith('ABC123');
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: {
                    ...mockGameState,
                    you: 'user-123',
                },
            });
        });

        it('should add you field to game state response', () => {
            const mockGameState = {
                current_turn: 0,
                players: [
                    {
                        player_id: 'user-123',
                        player_turn: 0,
                        position: 5,
                        player_money: 1500,
                        property_owns: [],
                        utility_owns: [],
                        transport_owns: [],
                    },
                ],
            };

            mockGameService.getGameState = jest.fn().mockReturnValue(mockGameState);

            GameController.getGameState(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: {
                    ...mockGameState,
                    you: 'user-123',
                },
            });
        });

        it('should return 400 when userId is missing', () => {
            mockRequest.user = {
                username: 'testUser',
                userId: '',
                roomCode: 'ABC123',
            };

            GameController.getGameState(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Required Property not found in token',
            });
            expect(mockGameService.getGameState).not.toHaveBeenCalled();
        });

        it('should return 400 when roomCode is missing', () => {
            mockRequest.user = {
                username: 'testUser',
                userId: 'user-123',
            };

            GameController.getGameState(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Required Property not found in token',
            });
            expect(mockGameService.getGameState).not.toHaveBeenCalled();
        });

        it('should return 400 when user object is undefined', () => {
            mockRequest = {};

            GameController.getGameState(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Required Property not found in token',
            });
        });

        it('should return 404 when game is not found', () => {
            mockGameService.getGameState = jest.fn().mockReturnValue(null);

            GameController.getGameState(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Game not found for this room',
            });
        });

        it('should return 500 when an error occurs', () => {
            mockGameService.getGameState = jest.fn().mockImplementation(() => {
                throw new Error('Service error');
            });

            GameController.getGameState(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'An error occurred while retrieving game state',
            });
        });
    });

    describe('rollDice', () => {
        beforeEach(() => {
            mockRequest.body = {
                playerId: 1,
            };
        });

        it('should roll dice successfully', () => {
            const mockDiceResult = {
                dice: [4, 3] as [number, number],
                total: 7,
                timestamp: new Date('2024-01-01T00:00:00Z'),
                newPosition: 7,
            };

            mockGameService.rollDice = jest.fn().mockReturnValue(mockDiceResult);

            GameController.rollDice(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockGameService.rollDice).toHaveBeenCalledWith('ABC123', "user-123");
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: {
                    dice: [4, 3],
                    total: 7,
                    timestamp: '2024-01-01T00:00:00.000Z',
                    newPosition: 7,
                },
            });
        });

        it('should return 400 when userId is missing', () => {
            mockRequest.user = {
                username: 'testUser',
                userId: '',
                roomCode: 'ABC123',
            };

            GameController.rollDice(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Required Property not found in token',
            });
            expect(mockGameService.rollDice).not.toHaveBeenCalled();
        });

        it('should return 400 when roomCode is missing', () => {
            mockRequest.user = {
                username: 'testUser',
                userId: 'user-123',
            };

            GameController.rollDice(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Required Property not found in token',
            });
            expect(mockGameService.rollDice).not.toHaveBeenCalled();
        });

        it('should return 400 when user object is undefined', () => {
            mockRequest = {
                body: { playerId: 1 },
            };

            GameController.rollDice(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Required Property not found in token',
            });
        });

        it('should return 404 when game or player not found', () => {
            mockGameService.rollDice = jest.fn().mockReturnValue(null);

            GameController.rollDice(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Game or player not found',
            });
        });

        it('should return 500 when an error occurs', () => {
            mockGameService.rollDice = jest.fn().mockImplementation(() => {
                throw new Error('Dice roll error');
            });

            GameController.rollDice(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'An error occurred while rolling dice',
            });
        });

        it('should handle different dice values', () => {
            const mockDiceResult = {
                dice: [6, 6] as [number, number],
                total: 12,
                timestamp: new Date('2024-01-01T00:00:00Z'),
                newPosition: 12,
            };

            mockGameService.rollDice = jest.fn().mockReturnValue(mockDiceResult);

            GameController.rollDice(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: {
                    dice: [6, 6],
                    total: 12,
                    timestamp: '2024-01-01T00:00:00.000Z',
                    newPosition: 12,
                },
            });
        });

        it('should handle position wrap-around', () => {
            const mockDiceResult = {
                dice: [5, 4] as [number, number],
                total: 9,
                timestamp: new Date('2024-01-01T00:00:00Z'),
                newPosition: 3, // Wrapped from 38 + 9 = 47 % 40 = 7
            };

            mockGameService.rollDice = jest.fn().mockReturnValue(mockDiceResult);

            GameController.rollDice(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: {
                    dice: [5, 4],
                    total: 9,
                    timestamp: '2024-01-01T00:00:00.000Z',
                    newPosition: 3,
                },
            });
        });
    });
});
