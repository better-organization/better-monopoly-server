import { Action, GameState, Phase } from '../types/game';
import { GameStateManager } from './GameStateManager';

export const ALLOWED_ACTIONS: Record<Phase, Action[]> = {
  [Phase.ROLL_DICE]: [Action.ROLL_DICE],
  [Phase.MOVE_PLAYER]: [Action.MOVE_PLAYER],
  [Phase.RESOLVE_TILE]: [Action.RESOLVE_TILE],
  [Phase.BUY_PROPERTY]: [Action.BUY_PROPERTY, Action.SKIP_BUY],
  [Phase.PAY_RENT]: [Action.PAY_RENT],
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
    const flow: Record<Phase, (state: GameState) => [Phase, Action[]]> = {
      [Phase.ROLL_DICE]: () => [
        Phase.MOVE_PLAYER,
        ALLOWED_ACTIONS[Phase.MOVE_PLAYER],
      ],
      [Phase.MOVE_PLAYER]: () => [
        Phase.RESOLVE_TILE,
        ALLOWED_ACTIONS[Phase.RESOLVE_TILE],
      ],
      [Phase.RESOLVE_TILE]: this.resolveTilePhaseChange,
      [Phase.BUY_PROPERTY]: () => [
        Phase.END_TURN,
        ALLOWED_ACTIONS[Phase.END_TURN],
      ],
      [Phase.PAY_RENT]: () => [
        Phase.END_TURN,
        ALLOWED_ACTIONS[Phase.END_TURN],
      ],
      [Phase.END_TURN]: () => [
        Phase.ROLL_DICE,
        ALLOWED_ACTIONS[Phase.ROLL_DICE],
      ],
      [Phase.GAME_OVER]: () => [
        Phase.GAME_OVER,
        ALLOWED_ACTIONS[Phase.GAME_OVER],
      ],
    };

    const [phase, allowedActions] = flow[state.phase](state);
    console.log('Transitioning from phase', state.phase, 'to', phase);
    return GameStateManager.changePhaseAndAllowedAction(
      state,
      phase,
      allowedActions
    );
  }

  private static resolveTilePhaseChange(state: GameState): [Phase, Action[]] {
    if (state.currentTile && !state.currentTile.isOwned) {
      return [Phase.BUY_PROPERTY, ALLOWED_ACTIONS[Phase.BUY_PROPERTY]];
    }

    if (
      state.currentTile?.isOwned &&
      !state.currentTile.isOwnerCurrentPlayer
    ) {
      return [Phase.PAY_RENT, ALLOWED_ACTIONS[Phase.PAY_RENT]];
    }

    return [Phase.END_TURN, ALLOWED_ACTIONS[Phase.END_TURN]];
  }

  static nextTurn(state: GameState): GameState {
    const nextIndex =
      (state.turn.currentPlayerIndex + 1) % state.players.length;
    const isNextRound = nextIndex === 0;

    return TurnManager.nextPhase(
      GameStateManager.changeTurn(state, nextIndex, isNextRound)
    );
  }
}
