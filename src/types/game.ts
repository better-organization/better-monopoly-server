// Game-related TypeScript types and interfaces
import { IPlayer } from '../models/Game';

/**
 * Game phases - strict flow control
 * ROLL_DICE → MOVE_PLAYER → RESOLVE_TILE → END_TURN
 */
export enum Phase {
  ROLL_DICE = 'ROLL_DICE',
  MOVE_PLAYER = 'MOVE_PLAYER',
  RESOLVE_TILE = 'RESOLVE_TILE',
  END_TURN = 'END_TURN',
  GAME_OVER = 'GAME_OVER',
  BUY_PROPERTY = 'BUY_PROPERTY',
}

export enum Action {
  ROLL_DICE = 'ROLL_DICE',
  MOVE_PLAYER = 'MOVE_PLAYER',
  RESOLVE_TILE = 'RESOLVE_TILE',
  END_TURN = 'END_TURN',
  BUY_PROPERTY = 'BUY_PROPERTY',
  SKIP_BUY = 'SKIP_BUY',
}

/**
 * Immutable GameState - single source of truth
 */

export interface GameState {
  phase: Phase;

  players: IPlayer[];

  turn: Turn;

  currentTile: TileInfo | undefined;

  lastDice: DiceRollResult | undefined;

  allowedActions: Action[];
}

export interface DiceRollResult {
  dice: [number, number];
  total: number;
  double: boolean;
}

export interface DiceRollResponse {
  dice: [number, number];
  total: number;
  timestamp: Date;
  newPosition: number;
  double: boolean;
}

export interface DiceRollData {
  dice: [number, number];
  total: number;
  timestamp: string;
  newPosition: number;
}

export interface Turn {
  currentPlayerIndex: number;
  round: number;
}

export interface TileInfo {
  index: number;
  type: string;
  isOwned: boolean;
  ownerId?: string;
  isOwnerCurrentPlayer?: boolean;
  price?: number;
  rent?: number;
}

// Game state response for polling
export interface GameStateResponse extends GameState {
  you?: string;
}
