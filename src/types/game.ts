// Game-related TypeScript types and interfaces

export interface DiceRollResult {
  dice: [number, number];
  total: number;
  timestamp: Date;
}

export interface DiceRollRequest {
  gameId?: string;
  playerId?: string;
}

export interface DiceRollData {
  dice: [number, number];
  total: number;
  timestamp: string;
}
