import { Action, DiceRollResult, GameState, Phase } from '../types/game';
import { TurnManager } from './TurnManager';
import { GameSettings, IPlayer } from '../models/Game';
import { FlattenedCell } from '../models/Board';
import { RentManager } from './RentManager';

export class GameStateManager {
  static initializeGameState(
    playerIds: string[],
    gameSettings: GameSettings
  ): GameState {
    return {
      phase: Phase.ROLL_DICE,
      players: this.initializePlayers(playerIds, gameSettings),
      turn: {
        currentPlayerIndex: 0,
        round: 1,
      },
      currentTile: undefined,
      lastDice: undefined,
      allowedActions: TurnManager.allowedActions(Phase.ROLL_DICE),
    };
  }

  static initializePlayers(
    playerIds: string[],
    gameSettings: GameSettings
  ): IPlayer[] {
    return playerIds.map((playerId, index) => ({
      player_id: playerId,
      player_turn: index,
      position: 0,
      player_money: gameSettings.startingMoney,
      property_owns: [],
      utility_owns: [],
      transport_owns: [],
    }));
  }

  static shallowCopyGameState(gameState: GameState): GameState {
    return {
      ...gameState,
      players: [...gameState.players],
      turn: { ...gameState.turn },
      currentTile: gameState.currentTile
        ? { ...gameState.currentTile }
        : undefined,
      lastDice: gameState.lastDice ? { ...gameState.lastDice } : undefined,
      allowedActions: [...gameState.allowedActions],
    };
  }

  static changePhaseAndAllowedAction(
    gameState: GameState,
    newPhase: Phase,
    allowedAction: Action[]
  ): GameState {
    return {
      ...gameState,
      phase: newPhase,
      allowedActions: allowedAction,
    };
  }

  static changeTurn(
    gameState: GameState,
    nextPlayerIndex: number,
    isNextRound: boolean
  ): GameState {
    return {
      ...gameState,
      turn: {
        currentPlayerIndex: nextPlayerIndex,
        round: gameState.turn.round + (isNextRound ? 1 : 0),
      },
      currentTile: undefined,
    };
  }

  static addDiceResult(
    gameState: GameState,
    diceResult: DiceRollResult
  ): GameState {
    return {
      ...gameState,
      lastDice: diceResult,
    };
  }

  static changePlayerInfo(
    gameState: GameState,
    playerDelta: Partial<IPlayer>,
    playerIndex: number
  ): GameState {
    return {
      ...gameState,
      players: [
        ...gameState.players.map((player, index) =>
          index === playerIndex ? { ...player, ...playerDelta } : player
        ),
      ],
    };
  }

  static setCurrentTile(gameState: GameState, tile: FlattenedCell): GameState {
    const owner = gameState.players.find(
      player =>
        player.property_owns.includes(tile.index) ||
        player.transport_owns.includes(tile.index) ||
        player.utility_owns.includes(tile.index)
    );

    const price =
      tile.cell_type === 'property'
        ? (tile.property_price ?? 0)
        : tile.cell_type === 'transport'
          ? (tile.transport_price ?? 0)
          : (tile.utility_price ?? 0);

    const isOwnerCurrentPlayer =
      owner !== undefined &&
      owner.player_turn === gameState.turn.currentPlayerIndex;

    let rentAmount: number | undefined;

    if (owner && !isOwnerCurrentPlayer) {
      const diceTotal = gameState.lastDice?.total ?? 0;
      rentAmount = this.setCurrentTileRent(tile, owner, diceTotal);
    }

    const tileDetails = owner
      ? {
          isOwned: true,
          ownerId: owner.player_id,
          isOwnerCurrentPlayer,
          rentAmount,
        }
      : { isOwned: false, price };

    return {
      ...gameState,
      currentTile: {
        index: tile.index,
        type: tile.cell_type,
        ...tileDetails,
      },
    };
  }

  static setCurrentTileRent(
    tile: FlattenedCell,
    owner: IPlayer | undefined,
    diceTotal: number
  ) {
    const rentAmount = {
      property: () => RentManager.calcPropertyRent(tile.house_rent),
      transport: () =>
        RentManager.calcTransportRent(
          tile.transport_rent,
          owner!.transport_owns.length
        ),
      utility: () =>
        RentManager.calcUtilityRent(
          tile.utility_rent_multiplier,
          owner!.utility_owns.length,
          diceTotal
        ),
    };

    return rentAmount[tile.cell_type as keyof typeof rentAmount]();
  }
}
