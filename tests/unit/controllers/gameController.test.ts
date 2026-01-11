import { Request, Response } from 'express';
import { GameController } from '../../../src/controllers/gameController';
import { GameService } from '../../../src/services/gameService';

// Mock GameService
jest.mock('../../../src/services/gameService');

describe('GameController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });

        mockRequest = {
            body: {},
        };

        mockResponse = {
            status: statusMock,
            json: jsonMock,
        };

        jest.clearAllMocks();
    });

    describe('rollDice', () => {
        it('should return 200 with dice roll result', async () => {
            const mockDiceResult = {
                dice: [3, 5] as [number, number],
                total: 8,
                timestamp: new Date('2026-01-11T13:34:17.000Z'),
            };

            (GameService.rollDice as jest.Mock).mockReturnValue(mockDiceResult);

            await GameController.rollDice(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: {
                    dice: [3, 5],
                    total: 8,
                    timestamp: '2026-01-11T13:34:17.000Z',
                },
            });
        });

        it('should call GameService.rollDice', async () => {
            const mockDiceResult = {
                dice: [1, 1] as [number, number],
                total: 2,
                timestamp: new Date(),
            };

            (GameService.rollDice as jest.Mock).mockReturnValue(mockDiceResult);

            await GameController.rollDice(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(GameService.rollDice).toHaveBeenCalledTimes(1);
        });

        it('should handle optional gameId and playerId', async () => {
            mockRequest.body = {
                gameId: 'game-123',
                playerId: 'player-456',
            };

            const mockDiceResult = {
                dice: [2, 4] as [number, number],
                total: 6,
                timestamp: new Date(),
            };

            (GameService.rollDice as jest.Mock).mockReturnValue(mockDiceResult);

            await GameController.rollDice(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        dice: [2, 4],
                        total: 6,
                    }),
                })
            );
        });

        it('should handle errors gracefully', async () => {
            (GameService.rollDice as jest.Mock).mockImplementation(() => {
                throw new Error('Test error');
            });

            await GameController.rollDice(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'An error occurred while rolling dice',
            });
        });

        it('should format timestamp as ISO string', async () => {
            const testDate = new Date('2026-01-11T18:55:17.123Z');
            const mockDiceResult = {
                dice: [6, 6] as [number, number],
                total: 12,
                timestamp: testDate,
            };

            (GameService.rollDice as jest.Mock).mockReturnValue(mockDiceResult);

            await GameController.rollDice(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        timestamp: '2026-01-11T18:55:17.123Z',
                    }),
                })
            );
        });
    });
});
