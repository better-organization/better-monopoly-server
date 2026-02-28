import { Board, FlattenedCell } from '../models/Board';
import {
  Tile,
  PropertyTile,
  TransportTile,
  UtilityTile,
  SpecialTile,
} from '../models/Tile';
import { GameState } from '../types/game';
import { GameStateManager } from './GameStateManager';

export class TileManagerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TileManagerError';
  }
}

export class TileManager {
  static buildTile(cell: FlattenedCell): Tile {
    switch (cell.cell_type) {
      case 'property':
        return new PropertyTile(cell);

      case 'transport':
        return new TransportTile(cell);

      case 'utility':
        return new UtilityTile(cell);

      case 'special':
        return new SpecialTile(cell);

      default:
        throw new TileManagerError(`Unknown cell_type: ${cell.cell_type}`);
    }
  }

  static resolveTile(gameState: GameState, board: Board): GameState {
    const currentPosition =
      gameState.players[gameState.turn.currentPlayerIndex]!.position;
    const cell = board.cells[currentPosition]!;
    const tile = this.buildTile(cell);
    return tile.resolveTile(gameState);
  }

  static buyTile(gameState: GameState): GameState {
    const currentTile = gameState.currentTile;
    if (!currentTile || currentTile.isOwned) {
      throw new TileManagerError('Cannot buy this tile');
    }

    const currentPlayerIndex = gameState.turn.currentPlayerIndex;
    const updatedPlayer = gameState.players[currentPlayerIndex]!;

    if (updatedPlayer.player_money < currentTile.price!) {
      throw new TileManagerError('Insufficient funds to purchase this tile');
    }

    if (currentTile.type === 'property') {
      return GameStateManager.changePlayerInfo(
        gameState,
        {
          property_owns: [...updatedPlayer.property_owns, currentTile.index],
          player_money: updatedPlayer.player_money - currentTile.price!,
        },
        currentPlayerIndex
      );
    } else if (currentTile.type === 'transport') {
      return GameStateManager.changePlayerInfo(
        gameState,
        {
          transport_owns: [...updatedPlayer.transport_owns, currentTile.index],
          player_money: updatedPlayer.player_money - currentTile.price!,
        },
        currentPlayerIndex
      );
    } else if (currentTile.type === 'utility') {
      return GameStateManager.changePlayerInfo(
        gameState,
        {
          utility_owns: [...updatedPlayer.utility_owns, currentTile.index],
          player_money: updatedPlayer.player_money - currentTile.price!,
        },
        currentPlayerIndex
      );
    }

    return gameState;
  }
}
