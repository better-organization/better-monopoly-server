// Game Model - In-Memory Storage
// Simple interfaces for game state management

// Property ownership interface
export interface PropertyOwnership {
  house_count: number;
  is_mortgaged: boolean;
}

// Player interface with new structure
export interface IPlayer {
  player_no: number;
  position: number;
  player_money: number;
  property_owns: string[];
  utility_owns: string[];
  transport_owns: string[];
}

// Game settings interface
export interface GameSettings {
  startingMoney: number;
  passGoMoney: number;
  jailFine: number;
  houseCost: number;
  hotelCost: number;
}

// Game interface
export interface IGame {
  gameId: string;
  players: IPlayer[];
  currentPlayer: number;
  status: 'waiting' | 'active' | 'finished';
  winner?: string | undefined;
  maxPlayers: number;
  hostId: string;
  gameSettings: GameSettings;
  createdAt: Date;
  updatedAt: Date;
}

// Default game settings
export const DEFAULT_GAME_SETTINGS: GameSettings = {
  startingMoney: 1500,
  passGoMoney: 200,
  jailFine: 50,
  houseCost: 100,
  hotelCost: 200,
};
