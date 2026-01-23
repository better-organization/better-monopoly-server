// Game-related TypeScript types and interfaces

export interface DiceRollResult {
  dice: [number, number];
  total: number;
  timestamp: Date;
  newPosition: number;
}

export interface DiceRollRequest {
  roomId: string;
  playerId: number;
}

export interface DiceRollData {
  dice: [number, number];
  total: number;
  timestamp: string;
  newPosition: number;
}

// Player structure for game state
export interface PlayerState {
  player_no: number;
  position: number;
  player_money: number;
  property_owns: string[];
  utility_owns: string[];
  transport_owns: string[];
}

// Game state response for polling
export interface GameStateResponse {
  players: PlayerState[];
}

