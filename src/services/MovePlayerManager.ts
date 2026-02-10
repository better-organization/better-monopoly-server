import { GameState, Phase } from '../types/game';

export class MovePlayerManagerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MovePlayerManagerError';
  }
}

export class MovePlayerManager {
  static movePlayer(state: GameState): GameState {
    if (state.phase !== Phase.MOVE_PLAYER) {
      throw new MovePlayerManagerError(
        `Cannot move player in phase ${state.phase}`
      );
    }

    if (!state.lastDice) {
      throw new MovePlayerManagerError(
        'Cannot move player without dice roll'
      );
    }

    const currentPlayerIndex = state.turn.currentPlayerIndex;
    const currentPlayer = state.players[currentPlayerIndex];
    currentPlayer!.position = (currentPlayer!.position + state.lastDice.total) % 40;

    return {...state, players: state.players.map(player => ({...player})) };
  }

  static currentPlayerPosition(state: GameState): number {
    const currentPlayerIndex = state.turn.currentPlayerIndex;
    return state.players[currentPlayerIndex]!.position;
  }
}