export interface roomInfo {
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

  addPlayer(username: string): void {
    this.players.add(username);
  }

  private getPlayers(): string[] {
    return Array.from(this.players);
  }

  getRoomInfo(): roomInfo {
    return {
      roomId: this.roomId,
      roomCode: this.roomCode,
      players: this.getPlayers(),
    };
  }
}
