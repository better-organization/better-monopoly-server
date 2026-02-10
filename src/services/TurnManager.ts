import { GameState, Phase, Action } from '../types/game';

export const ALLOWED_ACTIONS: Record<Phase, Action[]> = {
  [Phase.ROLL_DICE]: [Action.ROLL_DICE],
  [Phase.MOVE_PLAYER]: [Action.MOVE_PLAYER],
  [Phase.RESOLVE_TILE]: [Action.RESOLVE_TILE],
  [Phase.END_TURN]: [Action.END_TURN],
  [Phase.GAME_OVER]: [],
};

export class TurnManagerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TurnManagerError';
  }
}

export class TurnManager {
  static getCurrentPlayerId(state: GameState): string {
    return state.players[state.turn.currentPlayerIndex]!.player_id;
  }

  static assertPlayerTurn(state: GameState, playerId: string) {
    if (this.getCurrentPlayerId(state) !== playerId) {
      throw new TurnManagerError('Not your turn');
    }
  }

  static assertPhase(state: GameState, action: Action) {
    const allowed = ALLOWED_ACTIONS[state.phase];
    if (!allowed!.includes(action)) {
      throw new TurnManagerError(
        `Action ${action} not allowed in phase ${state.phase}`
      );
    }
  }

  static allowedActions(phase: Phase): Action[] {
    return ALLOWED_ACTIONS[phase];
  }

  static nextPhase(state: GameState): GameState {
    const flow: Record<Phase, Phase> = {
      [Phase.ROLL_DICE]: Phase.MOVE_PLAYER,
      [Phase.MOVE_PLAYER]: Phase.END_TURN,
      [Phase.END_TURN]: Phase.ROLL_DICE,
      [Phase.GAME_OVER]: Phase.GAME_OVER,
      [Phase.RESOLVE_TILE]: Phase.RESOLVE_TILE,
    };

    return {
      ...state,
      phase: flow[state.phase],
      allowedActions: this.allowedActions(flow[state.phase]),
    };
  }

  nextTurn(state: GameState): GameState {
    const nextIndex =
      (state.turn.currentPlayerIndex + 1) % state.players.length;

    return TurnManager.nextPhase({
      ...state,
      turn: {
        currentPlayerIndex: nextIndex,
        round: state.turn.round + (nextIndex === 0 ? 1 : 0),
      },
    });
  }
}
