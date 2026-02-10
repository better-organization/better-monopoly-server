// Game Model
// Game entity class and related interfaces

import { Action, DiceRollResponse, GameState, Phase } from '../types/game';
import { ITimeService, timeService } from '../services/timeService';
import { TurnManager } from '../services/TurnManager';
import { RollDiceManager } from '../services/RollDiceManager';
import { MovePlayerManager } from '../services/MovePlayerManager';

// Player interface
export interface IPlayer {
  player_id: string;
  player_turn: number;
  position: number;
  player_money: number;
  property_owns: string[];
  utility_owns: string[];
  transport_owns: string[];
}

// Game settings interface
export interface GameSettings {
  board: string;
  version: string;
  startingMoney: number;
  passGoMoney: number;
  jailFine: number;
  houseCost: number;
  hotelCost: number;
}

// Default game settings
export const DEFAULT_GAME_SETTINGS: GameSettings = {
  board: 'european_football_club_giants',
  version: '1.0',
  startingMoney: 1500,
  passGoMoney: 200,
  jailFine: 50,
  houseCost: 100,
  hotelCost: 200,
};

/**
 * Game class - represents a single game instance for a room
 * Similar to Room class pattern
 */
export class Game {
  public roomId: string;
  public gameId: string;
  public status: 'waiting' | 'active' | 'finished';
  public winner?: string;
  public maxPlayers: number;
  public hostId: string;
  public gameSettings: GameSettings;
  public createdAt: Date;
  public updatedAt: Date;
  public gameState: GameState;

  constructor(roomId: string, playerIds: string[], gameNumber: number = 1) {
    this.roomId = roomId;
    this.gameId = `${roomId}-g${gameNumber}`;
    this.status = 'waiting';
    this.maxPlayers = playerIds.length;
    this.hostId = playerIds[0] || '';
    this.gameSettings = DEFAULT_GAME_SETTINGS;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.gameState = this.initializeGameState(playerIds);
  }

  initializeGameState(playerIds: string[]): GameState {
    return  {
      phase: Phase.ROLL_DICE,
      players: this.initializePlayers(playerIds),
      turn: {
        currentPlayerIndex: 0,
        round: 1,
      },
      lastDice: undefined,
      allowedActions: TurnManager.allowedActions(Phase.ROLL_DICE),
    };
  }

  initializePlayers(playerIds: string[]): IPlayer[] {
    return playerIds.map((playerId, index) => ({
      player_id: playerId,
      player_turn: index,
      position: 0,
      player_money: this.gameSettings.startingMoney,
      property_owns: [],
      utility_owns: [],
      transport_owns: [],
    }));
  }

  /**
   * Get current game state
   */
  getGameState(): GameState {
    return { ...this.gameState };
  }

  /**
   * Get board information for this game
   */
  getBoardInfo(): { boardId: string; version: string } {
    return {
      boardId: this.gameSettings.board,
      version: this.gameSettings.version,
    };
  }

  rollDiceAndUpdatePosition(
    playerId: string,
    timeServiceInstance: ITimeService = timeService
  ): DiceRollResponse {

    TurnManager.assertPlayerTurn(this.gameState, playerId);
    TurnManager.assertPhase(this.gameState, Action.ROLL_DICE);

    this.gameState = RollDiceManager.rollDice(this.gameState);
    this.gameState = TurnManager.nextPhase(this.gameState);
    this.gameState = MovePlayerManager.movePlayer(this.gameState);
    this.gameState = TurnManager.nextPhase(this.gameState);

    const timestamp = timeServiceInstance.now();
    const newPosition = MovePlayerManager.currentPlayerPosition(this.gameState);

    return {...this.gameState.lastDice!, timestamp, newPosition };
  }

  endTurn(playerId: string): boolean {
    TurnManager.assertPlayerTurn(this.gameState, playerId);
    TurnManager.assertPhase(this.gameState, Action.END_TURN);

    this.gameState = new TurnManager().nextTurn(this.gameState);
    return true;
  }
}
