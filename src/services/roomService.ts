import { Room, IRoomInfo } from '../models/Room';
import { randomUUID } from 'node:crypto';

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
}
