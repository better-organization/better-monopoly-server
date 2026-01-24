import { Request, Response } from 'express';
import { errorType, RoomController } from '../../../src/controllers/roomController';
import { RoomService } from '../../../src/services/roomService';
import { tokenUtil, IUserTokenPayload } from '../../../src/utils/TokenUtil';
import { cookieUtil } from '../../../src/utils/cookieUtil';

// Mock dependencies
jest.mock('../../../src/services/roomService');
jest.mock('../../../src/utils/TokenUtil');
jest.mock('../../../src/utils/cookieUtil');

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: IUserTokenPayload;
}

describe('RoomController', () => {
  let roomController: RoomController;
  let mockRoomService: jest.Mocked<RoomService>;
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock service instance
    mockRoomService = {
      createRoom: jest.fn(),
      getRoom: jest.fn(),
      getRoomById: jest.fn(),
      clearStorage: jest.fn(),
      joinRoom: jest.fn(),
      startGame: jest.fn(),
    } as unknown as jest.Mocked<RoomService>;

    // Mock getInstance to return our mock service
    (RoomService.getInstance as jest.Mock) = jest.fn().mockReturnValue(mockRoomService);

    // Create controller with mocked service
    roomController = new RoomController(mockRoomService);

    // Setup mock response
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    // Setup basic mock request
    mockRequest = {
      user: {
        username: 'testUser',
        userId: 'user-123',
      },
      cookies: {},
    } as Partial<AuthenticatedRequest>;
  });

  describe('createRoom', () => {
    it('should create a room successfully', () => {
      const mockRoomInfo = {
        roomId: 'room-uuid-123',
        roomCode: 'ABC123',
        players: ['testUser'],
      };

      mockRoomService.createRoom = jest.fn().mockReturnValue(mockRoomInfo);
      (cookieUtil.getCookie as jest.Mock).mockReturnValue('mock-token');
      (tokenUtil.parseGameToken as jest.Mock).mockReturnValue('updated-token');

      roomController.createRoom(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockRoomService.createRoom).toHaveBeenCalledWith('user-123');
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Room created successfully',
        data: {roomCode: 'ABC123'},
      });
    });

    it('should return 400 when username is missing', () => {
      mockRequest = {};

      roomController.createRoom(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Required Property not found in token",
        success: false,
      });
      expect(mockRoomService.createRoom).not.toHaveBeenCalled();
    });

    it('should return 400 when username is empty string', () => {
      mockRequest.user = {
        username: 'user-123',
        userId: '',
      };

      roomController.createRoom(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Required Property not found in token",
        success: false,
      });
    });

    it('should return 500 when room creation fails', () => {
      mockRoomService.createRoom = jest.fn().mockReturnValue(null);

      roomController.createRoom(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Failed to create room',
        success: false,
      });
    });

    it('should update auth token with roomId when token exists', () => {
      const mockRoomInfo = {
        roomId: 'room-uuid-123',
        roomCode: 'ABC123',
        players: ['testUser'],
      };

      mockRoomService.createRoom = jest.fn().mockReturnValue(mockRoomInfo);
      (cookieUtil.getCookie as jest.Mock).mockReturnValue('auth-token');
      (tokenUtil.parseGameToken as jest.Mock).mockReturnValue('game-token');
      (cookieUtil.setCookie as jest.Mock).mockImplementation(() => {});

      roomController.createRoom(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(tokenUtil.parseGameToken).toHaveBeenCalledWith('ABC123');
      expect(cookieUtil.setCookie).toHaveBeenCalledWith(
        mockResponse,
        'game_token',
        'game-token',
        24
      );
    });

    it('should not update token if no token exists', () => {
      (cookieUtil.getCookie as jest.Mock).mockReturnValue(undefined);

      roomController.createRoom(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(tokenUtil.parseGameToken).not.toHaveBeenCalled();
      expect(cookieUtil.setCookie).not.toHaveBeenCalled();
    });
  });

  describe('roomStatus', () => {
    beforeEach(() => {
      mockRequest.user = {
        username: 'testUser',
        userId: 'user-123',
        roomCode: 'ABC123',
      };
    });

    it('should return room status successfully', () => {
      const mockRoomInfo = {
        roomId: 'room-uuid-123',
        roomCode: 'ABC123',
        players: ['testUser', 'player2'],
      };

      mockRoomService.getRoom = jest.fn().mockReturnValue(mockRoomInfo);

      roomController.roomStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockRoomService.getRoom).toHaveBeenCalledWith('ABC123');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        data: mockRoomInfo,
        message: "Room status retrieved successfully",
        success: true,
      });
    });

    it('should return 400 when username is missing', () => {
      mockRequest.user = {
        username: 'UserId',
        userId: '',
        roomCode: 'ABC123',
      };

      roomController.roomStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Required Property not found in token",
        success: false,
      });
      expect(mockRoomService.getRoom).not.toHaveBeenCalled();
    });

    it('should return 400 when roomCode is missing', () => {
      mockRequest.user = {
        username: 'testUser',
        userId: 'user-123',
      };

      roomController.roomStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Required Property not found in token",
        success: false,
      });
      expect(mockRoomService.getRoom).not.toHaveBeenCalled();
    });

    it('should return 400 when roomCode is empty string', () => {
      mockRequest.user = {
        username: 'testUser',
        userId: 'user-123',
        roomCode: '',
      };

      roomController.roomStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Required Property not found in token",
        success: false,
      });
    });

    it('should return 404 when room is not found', () => {
      mockRoomService.getRoom = jest.fn().mockReturnValue(undefined);

      roomController.roomStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Room not found',
        success: false,
      });
    });

    it('should return 400 when user object is undefined', () => {
      mockRequest = {};

      roomController.roomStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Required Property not found in token",
        success: false,
      });
    });
  });

  describe('joinRoom', () => {
    it('should return 400 when username is missing', () => {
      mockRequest = {};

      roomController.joinRoom(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Required Property not found in token",
        success: false,
      });
    });

    it('should return 400 when roomCode is missing', () => {
      mockRequest.user = {
        username: 'testUser',
        userId: 'user-123',
      };

      roomController.joinRoom(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Required Property not found in request",
        success: false,
      });
    });

    it('should return 400 when roomCode is empty string', () => {
      mockRequest.user = {
        username: 'testUser',
        userId: 'user-123',
        roomCode: '',
      };

      roomController.joinRoom(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Required Property not found in request",
        success: false,
      });
    });

    it('should return 200 when joining room is successful', () => {
      mockRequest.user = {
        username: 'testUser',
        userId: 'user-123',
      };
      mockRequest.body = {
        roomCode: 'ABC123',
      };

      mockRoomService.joinRoom = jest.fn().mockReturnValue(true);

      roomController.joinRoom(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockRoomService.joinRoom).toHaveBeenCalledWith('ABC123', 'user-123');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Joined room successfully',
      });
    });

    it('should return 400 when joining room fails', () => {
      mockRequest.user = {
        username: 'testUser',
        userId: 'user-123',
      };
      mockRequest.body = {
        roomCode: 'ABC123',
      };

      mockRoomService.joinRoom = jest.fn().mockReturnValue(false);

      roomController.joinRoom(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockRoomService.joinRoom).toHaveBeenCalledWith('ABC123', 'user-123');
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Failed to join room',
        success: false,
      });
    });

    it('should return 500 when an error occurs while joining room', () => {
      mockRequest.user = {
        username: 'testUser',
        userId: 'user-123',
      };

      mockRequest.body = {
        roomCode: 'ABC123',
      };

      mockRoomService.joinRoom = jest.fn().mockImplementation(() => {
        throw new Error('Join room error');
      });

      roomController.joinRoom(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockRoomService.joinRoom).toHaveBeenCalledWith('ABC123', 'user-123');
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'An error occurred while trying to join the room',
      });
    });
  });

  describe('startGame', () => {
    beforeEach(() => {
      mockRequest.user = {
        username: 'testUser',
        userId: 'user-123',
        roomCode: 'ABC123',
      };
    });

    it('should start game successfully when all validations pass', async () => {
      const mockStartGameResult = {
        success: true,
        message: 'Game started successfully',
        gameId: 'game-uuid-456',
      };

      mockRoomService.startGame = jest.fn().mockResolvedValue(mockStartGameResult);

      await roomController.startGame(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockRoomService.startGame).toHaveBeenCalledWith('ABC123', 'user-123');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Game started successfully',
      });
    });

    it('should return 400 when userId is missing in token', async () => {
      mockRequest.user = {
        username: 'testUser',
        userId: '',
        roomCode: 'ABC123',
      };

      await roomController.startGame(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Required Property not found in token',
      });
      expect(mockRoomService.startGame).not.toHaveBeenCalled();
    });

    it('should return 400 when roomCode is missing in token', async () => {
      mockRequest.user = {
        username: 'testUser',
        userId: 'user-123',
        roomCode: '',
      };

      await roomController.startGame(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Required Property not found in token',
      });
      expect(mockRoomService.startGame).not.toHaveBeenCalled();
    });

    it('should return 400 when both userId and roomCode are missing', async () => {
      mockRequest.user = {
        username: 'testUser',
        userId: '',
        roomCode: '',
      };

      await roomController.startGame(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Required Property not found in token',
      });
      expect(mockRoomService.startGame).not.toHaveBeenCalled();
    });

    it('should return 400 when user object is undefined', async () => {
      mockRequest = {};

      await roomController.startGame(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Required Property not found in token',
      });
      expect(mockRoomService.startGame).not.toHaveBeenCalled();
    });

    it('should return 404 when room is not found', async () => {
      const mockStartGameResult = {
        success: false,
        message: 'Room not found',
        errorType: errorType.NOT_FOUND,
      };

      mockRoomService.startGame = jest.fn().mockResolvedValue(mockStartGameResult);

      await roomController.startGame(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockRoomService.startGame).toHaveBeenCalledWith('ABC123', 'user-123');
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Room not found',
      });
    });

    it('should return 403 when user is not the room host', async () => {
      const mockStartGameResult = {
        success: false,
        message: 'Only the room host can start the game',
        errorType: errorType.FORBIDDEN,
      };

      mockRoomService.startGame = jest.fn().mockResolvedValue(mockStartGameResult);

      await roomController.startGame(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockRoomService.startGame).toHaveBeenCalledWith('ABC123', 'user-123');
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Only the room host can start the game',
      });
    });

    it('should return 400 when game has already started', async () => {
      const mockStartGameResult = {
        success: false,
        message: 'Game has already started',
        errorType: errorType.BAD_REQUEST
      };

      mockRoomService.startGame = jest.fn().mockResolvedValue(mockStartGameResult);

      await roomController.startGame(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockRoomService.startGame).toHaveBeenCalledWith('ABC123', 'user-123');
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Game has already started',
      });
    });

    it('should return 400 when not enough players are in the room', async () => {
      const mockStartGameResult = {
        success: false,
        message: 'Not enough players to start the game',
        errorType: errorType.BAD_REQUEST
      };

      mockRoomService.startGame = jest.fn().mockResolvedValue(mockStartGameResult);

      await roomController.startGame(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockRoomService.startGame).toHaveBeenCalledWith('ABC123', 'user-123');
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Not enough players to start the game',
      });
    });

    it('should return 500 when an unexpected error occurs', async () => {
      mockRoomService.startGame = jest.fn().mockRejectedValue(new Error('Database error'));

      await roomController.startGame(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockRoomService.startGame).toHaveBeenCalledWith('ABC123', 'user-123');
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'An error occurred while starting the game',
      });
    });

    it('should return 500 when service throws an exception', async () => {
      mockRoomService.startGame = jest.fn().mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await roomController.startGame(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockRoomService.startGame).toHaveBeenCalledWith('ABC123', 'user-123');
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'An error occurred while starting the game',
      });
    });

    it('should handle generic error messages with 400 status', async () => {
      const mockStartGameResult = {
        success: false,
        message: 'Some other validation error',
      };

      mockRoomService.startGame = jest.fn().mockResolvedValue(mockStartGameResult);

      await roomController.startGame(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockRoomService.startGame).toHaveBeenCalledWith('ABC123', 'user-123');
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Some other validation error',
      });
    });
  });
});

