import { Room, IRoomInfo, RoomState } from '../models/Room';
import { randomUUID } from 'node:crypto';
import { GAME_CONSTANTS } from '../config/gameConstants';
import { GameService } from './gameService';
import {
  RESPONSE_MESSAGES,
  getMinPlayersMessage,
} from '../utils/responseMessages';

export interface StartGameResult {
  success: boolean;
  message: string;
  gameId?: string;
}

export class RoomService {
  private static instance: RoomService;
  private roomsById: Map<string, Room>;
  private roomsByCode: Map<string, string>;

  private constructor() {
    this.roomsById = new Map();
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
    this.roomsById.clear();
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

    this.roomsById.set(roomId, room);
    this.roomsByCode.set(roomCode, roomId);

    return room.getRoomInfo();
  }

  getRoomById(roomId: string): IRoomInfo | undefined {
    return this.roomsById.get(roomId)?.getRoomInfo();
  }

  getRoom(roomCode: string): IRoomInfo | undefined {
    const roomId = this.roomsByCode.get(roomCode);
    if (roomId) {
      return this.getRoomById(roomId);
    }

    return;
  }

  joinRoom(roomCode: string, userId: string) {
    const roomId = this.roomsByCode.get(roomCode);
    if (roomId) {
      const room = this.roomsById.get(roomId);
      return room?.addPlayer(userId);
    }

    return false;
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
      };
    }

    // Validate user is the host (first player)
    const hostId = room.getHostId();
    if (hostId !== userId) {
      return {
        success: false,
        message: RESPONSE_MESSAGES.NOT_ROOM_HOST,
      };
    }

    // Check room state
    if (room.getRoomState() !== RoomState.WAITING) {
      return {
        success: false,
        message: RESPONSE_MESSAGES.GAME_ALREADY_STARTED,
      };
    }

    // Check minimum players
    if (room.getPlayerCount() < GAME_CONSTANTS.MIN_PLAYERS) {
      return {
        success: false,
        message: getMinPlayersMessage(GAME_CONSTANTS.MIN_PLAYERS),
      };
    }

    return null;
  }

  async startGame(roomCode: string, userId: string): Promise<StartGameResult> {
    // Get room by room code
    const roomId = this.roomsByCode.get(roomCode);
    const room = roomId ? this.roomsById.get(roomId) : undefined;

    // Validate before proceeding
    const validationError = this.validateStartGame(room, userId);
    if (validationError) {
      return validationError;
    }

    // At this point, room is guaranteed to exist and validations passed
    const roomInfo = room!.getRoomInfo();

    // Create game instance
    const game = await GameService.createGame(roomInfo.players);

    // Assign game ID to room
    room!.setGameId(game.id);

    return {
      success: true,
      message: RESPONSE_MESSAGES.GAME_STARTED_SUCCESSFULLY,
      gameId: game.id,
    };
  }
}
