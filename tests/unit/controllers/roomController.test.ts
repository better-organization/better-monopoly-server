import { Request, Response } from 'express';
import { RoomController } from '../../../src/controllers/roomController';
import { RoomService } from '../../../src/services/roomService';
import { tokenUtil, ITokenPayload } from '../../../src/utils/TokenUtil';
import { cookieUtil } from '../../../src/utils/cookieUtil';

// Mock dependencies
jest.mock('../../../src/services/roomService');
jest.mock('../../../src/utils/TokenUtil');
jest.mock('../../../src/utils/cookieUtil');

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: ITokenPayload;
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
        roomCode: null,
        gameId: null,
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
      (tokenUtil.updateRoomCode as jest.Mock).mockReturnValue('updated-token');

      roomController.createRoom(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockRoomService.createRoom).toHaveBeenCalledWith('testUser');
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Room created successfully',
        roomCode: 'ABC123',
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
        error: 'Bad Request',
        message: 'Username not found in authentication token',
      });
      expect(mockRoomService.createRoom).not.toHaveBeenCalled();
    });

    it('should return 400 when username is empty string', () => {
      mockRequest.user = {
        username: '',
        userId: 'user-123',
        roomCode: null,
        gameId: null,
      };

      roomController.createRoom(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Username not found in authentication token',
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
      });
    });

    it('should update auth token with roomId when token exists', () => {
      const mockRoomInfo = {
        roomId: 'room-uuid-123',
        roomCode: 'ABC123',
        players: ['testUser'],
      };

      mockRoomService.createRoom = jest.fn().mockReturnValue(mockRoomInfo);
      (cookieUtil.getCookie as jest.Mock).mockReturnValue('existing-token');
      (tokenUtil.updateRoomCode as jest.Mock).mockReturnValue('updated-token');
      (cookieUtil.setCookie as jest.Mock).mockImplementation(() => {});

      roomController.createRoom(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(cookieUtil.getCookie).toHaveBeenCalledWith(
        mockRequest,
        'auth_token'
      );
      expect(tokenUtil.updateRoomCode).toHaveBeenCalledWith(
        'existing-token',
        'ABC123'
      );
      expect(cookieUtil.setCookie).toHaveBeenCalledWith(
        mockResponse,
        'auth_token',
        'updated-token',
        24
      );
    });

    it('should not update token if no token exists', () => {
      (cookieUtil.getCookie as jest.Mock).mockReturnValue(undefined);

      roomController.createRoom(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(tokenUtil.updateRoomCode).not.toHaveBeenCalled();
      expect(cookieUtil.setCookie).not.toHaveBeenCalled();
    });
  });

  describe('roomStatus', () => {
    beforeEach(() => {
      mockRequest.user = {
        username: 'testUser',
        userId: 'user-123',
        roomCode: 'ABC123',
        gameId: null,
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
      expect(jsonMock).toHaveBeenCalledWith(mockRoomInfo);
    });

    it('should return 400 when username is missing', () => {
      mockRequest.user = {
        username: '',
        userId: 'user-123',
        roomCode: 'ABC123',
        gameId: null,
      };

      roomController.roomStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'username not found in authentication token',
      });
      expect(mockRoomService.getRoom).not.toHaveBeenCalled();
    });

    it('should return 400 when roomCode is missing', () => {
      mockRequest.user = {
        username: 'testUser',
        userId: 'user-123',
        roomCode: null,
        gameId: null,
      };

      roomController.roomStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'roomCode not found in authentication token',
      });
      expect(mockRoomService.getRoom).not.toHaveBeenCalled();
    });

    it('should return 400 when roomCode is empty string', () => {
      mockRequest.user = {
        username: 'testUser',
        userId: 'user-123',
        roomCode: '',
        gameId: null,
      };

      roomController.roomStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'roomCode not found in authentication token',
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
        error: 'Not Found',
        message: 'Room not found',
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
        error: 'Bad Request',
        message: 'username not found in authentication token',
      });
    });
  });
});

