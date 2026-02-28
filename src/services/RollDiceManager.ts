import { GameState, Phase } from '../types/game';
import { GameStateManager } from './GameStateManager';

export class RollDiceManagerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RollDiceManagerError';
  }
}

export class RollDiceManager {
  public static diceResult(): number {
    return Math.floor(Math.random() * 6) + 1;
  }

  static rollDice(
    state: GameState,
    diceRoller: typeof this.diceResult = this.diceResult
  ): GameState {
    if (state.phase !== Phase.ROLL_DICE) {
      throw new RollDiceManagerError(
        `Cannot roll dice in phase ${state.phase}`
      );
    }

    const dice: [number, number] = [diceRoller(), diceRoller()];
    const total = dice[0] + dice[1];
    const double = dice[0] === dice[1];
    return GameStateManager.addDiceResult(state, { dice, total, double });
  }
}
