export const GAME_CONSTANTS = {
  // Player limits
  MIN_PLAYERS: 2 as number,
  MAX_PLAYERS: 2 as number,

  // Room configuration
  ROOM_CODE_LENGTH: 6,
  ROOM_EXPIRY_HOURS: 24,

  // Game currency
  STARTING_MONEY: 1500,
  PASS_GO_MONEY: 200,

  // Jail
  JAIL_FINE: 50,
  MAX_JAIL_TURNS: 3,

  // Property improvements
  HOUSE_COST: 100,
  HOTEL_COST: 100,
} as const;

export type GameConstants = typeof GAME_CONSTANTS;
