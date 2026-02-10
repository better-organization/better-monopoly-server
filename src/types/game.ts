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
}

export enum Action {
  ROLL_DICE = 'ROLL_DICE',
  MOVE_PLAYER = 'MOVE_PLAYER',
  RESOLVE_TILE = 'RESOLVE_TILE',
  END_TURN = 'END_TURN',
}

/**
 * Immutable GameState - single source of truth
 */

export interface GameState {
  phase: Phase;

  players: IPlayer[];

  turn: {
    currentPlayerIndex: number;
    round: number;
  };

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

// Game state response for polling
export interface GameStateResponse extends GameState {
  you?: string;
}
