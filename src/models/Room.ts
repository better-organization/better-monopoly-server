import { GAME_CONSTANTS } from '../config/gameConstants';

export enum RoomState {
  WAITING = 'WAITING',
  IN_GAME = 'IN_GAME',
  FINISHED = 'FINISHED',
}

export interface IRoomInfo {
  roomId: string;
  roomCode: string;
  players: string[];
  maxPlayers: number;
  roomState: string;
  user?: string;
}

export class Room {
  private roomId: string;
  private roomCode: string;
  private players: Set<string>;
  private maxPlayers: number = GAME_CONSTANTS.MAX_PLAYERS;
  private gameId: string | null = null;
  private roomState: RoomState;

  constructor(roomId: string, roomCode: string) {
    this.roomId = roomId;
    this.roomCode = roomCode;
    this.players = new Set<string>();
    this.roomState = RoomState.WAITING;
  }

  addPlayer(userId: string): boolean {
    const currentSize = this.players.size;
    this.players.add(userId);
    return currentSize + 1 === this.players.size;
  }

  setGameId(gameId: string): void {
    this.gameId = gameId;
    this.roomState = RoomState.IN_GAME;
  }

  getGameId(): string | null {
    return this.gameId;
  }

  getHostId(): string | null {
    const playersArray = this.getPlayers();
    return playersArray.length > 0 ? (playersArray[0] ?? null) : null;
  }

  getRoomState(): RoomState {
    return this.roomState;
  }

  getPlayerCount(): number {
    return this.players.size;
  }

  private getPlayers(): string[] {
    return Array.from(this.players);
  }

  getRoomInfo(): IRoomInfo {
    return {
      roomId: this.roomId,
      roomCode: this.roomCode,
      players: this.getPlayers(),
      maxPlayers: this.maxPlayers,
      roomState: this.roomState,
    };
  }
}
