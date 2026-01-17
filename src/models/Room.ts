export interface IRoomInfo {
  roomId: string;
  roomCode: string;
  players: string[];
}

export class Room {
  private roomId: string;
  private roomCode: string;
  private players: Set<string>;

  constructor(roomId: string, roomCode: string) {
    this.roomId = roomId;
    this.roomCode = roomCode;
    this.players = new Set<string>();
  }

  addPlayer(username: string): boolean {
    const currentSize = this.players.size;
    this.players.add(username);
    return currentSize + 1 === this.players.size;
  }

  private getPlayers(): string[] {
    return Array.from(this.players);
  }

  getRoomInfo(): IRoomInfo {
    return {
      roomId: this.roomId,
      roomCode: this.roomCode,
      players: this.getPlayers(),
    };
  }
}
