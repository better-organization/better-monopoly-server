import { Room, IRoomInfo, RoomState } from '../models/Room';
import { randomUUID } from 'node:crypto';
import { GAME_CONSTANTS } from '../config/gameConstants';
import { GameService } from './gameService';
import { RESPONSE_MESSAGES } from '../utils/responseMessages';
import { errorType } from '../controllers/roomController';

export interface StartGameResult {
  success: boolean;
  message: string;
  errorType?: string;
  gameId?: string;
}

export class RoomService {
  private static instance: RoomService;
  private roomsByCode: Map<string, Room>;

  private constructor() {
    this.roomsByCode = new Map();
  }

  static getInstance(): RoomService {
    if (!RoomService.instance) {
      const roomService = new RoomService();
      roomService.createRoom = roomService.createRoom.bind(roomService);
      roomService.getRoom = roomService.getRoom.bind(roomService);
      RoomService.instance = roomService;
    }
    return RoomService.instance;
  }

  clearStorage(): void {
    this.roomsByCode.clear();
  }

  private generateRoomCode(length: number = 6): string {
    const chars = '1234567890';
    let code: string;

    do {
      code = Array.from(
        { length },
        () => chars[Math.floor(Math.random() * chars.length)]
      ).join('');
    } while (this.roomsByCode.has(code));

    return code;
  }

  createRoom(userId: string): IRoomInfo {
    const roomId = randomUUID();
    const roomCode = this.generateRoomCode();

    const room = new Room(roomId, roomCode);
    room.addPlayer(userId);

    this.roomsByCode.set(roomCode, room);

    return room.getRoomInfo();
  }

  getRoom(roomCode: string): IRoomInfo | undefined {
    return this.roomsByCode.get(roomCode)?.getRoomInfo();
  }

  joinRoom(roomCode: string, userId: string) {
    return Boolean(this.roomsByCode.get(roomCode)?.addPlayer(userId));
  }

  private validateStartGame(
    room: Room | undefined,
    userId: string
  ): StartGameResult | null {
    // Check if room exists
    if (!room) {
      return {
        success: false,
        message: RESPONSE_MESSAGES.ROOM_NOT_FOUND,
        errorType: errorType.NOT_FOUND,
      };
    }
    // Validate user is the host (first player)
    const hostId = room.getHostId();
    if (hostId !== userId) {
      return {
        success: false,
        message: RESPONSE_MESSAGES.NOT_ROOM_HOST,
        errorType: errorType.FORBIDDEN,
      };
    }
    // Check room state
    if (room.getRoomState() !== RoomState.WAITING) {
      return {
        success: false,
        message: RESPONSE_MESSAGES.GAME_ALREADY_STARTED,
        errorType: errorType.BAD_REQUEST,
      };
    }
    // Check minimum players
    if (room.getPlayerCount() < GAME_CONSTANTS.MIN_PLAYERS) {
      return {
        success: false,
        message: RESPONSE_MESSAGES.NOT_ENOUGH_PLAYERS,
        errorType: errorType.BAD_REQUEST,
      };
    }
    return null;
  }

  async startGame(roomCode: string, userId: string): Promise<StartGameResult> {
    // Get room by room code
    const room = this.roomsByCode.get(roomCode);

    // Validate before proceeding
    const validationError = this.validateStartGame(room, userId);
    if (validationError) {
      return validationError;
    }

    // At this point, room is guaranteed to exist and validations passed
    const roomInfo = room!.getRoomInfo();
    const hostId = room!.getHostId();

    if (!hostId) {
      return {
        success: false,
        message: 'No host found in room',
        errorType: errorType.BAD_REQUEST,
      };
    }

    // Create game instance with players
    const gameService = GameService.getInstance();
    const gameNumber = room!.getGameNumber();
    const game = gameService.createGame(
      roomInfo.roomId,
      roomInfo.players,
      gameNumber + 1
    );

    // Set game ID to room (this also updates room state to IN_GAME)
    room!.setGameId(game.gameId);

    return {
      success: true,
      message: RESPONSE_MESSAGES.GAME_STARTED_SUCCESSFULLY,
    };
  }
}
