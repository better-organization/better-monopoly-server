import { GameState } from '../types/game';
import { FlattenedCell } from './Board';
import { GameStateManager } from '../services/GameStateManager';

export abstract class Tile {
  protected cell: FlattenedCell;

  constructor(cell: FlattenedCell) {
    this.cell = cell;
  }

  abstract resolveTile(gameState: GameState): GameState;
}

/**
 * PropertyTile - handles property cells (clubs/teams)
 */
export class PropertyTile extends Tile {
  resolveTile(gameState: GameState): GameState {
    console.log(`Property tile: ${this.cell.name}`);

    return GameStateManager.setCurrentTile(gameState, this.cell);
  }
}

/**
 * TransportTile - handles transport/station cells
 */
export class TransportTile extends Tile {
  resolveTile(gameState: GameState): GameState {
    console.log(`Transport tile: ${this.cell.name}`);

    return GameStateManager.setCurrentTile(gameState, this.cell);
  }
}

/**
 * UtilityTile - handles utility cells
 */
export class UtilityTile extends Tile {
  resolveTile(gameState: GameState): GameState {
    console.log(`Utility tile: ${this.cell.name}`);

    return GameStateManager.setCurrentTile(gameState, this.cell);
  }
}

/**
 * SpecialTile - handles special cells (Go, Tax, Jail, Chance, etc.)
 */
export class SpecialTile extends Tile {
  resolveTile(gameState: GameState): GameState {
    // TODO: Implement Special Tile logic

    return gameState;
  }
}
