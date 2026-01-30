// Game Model
// Game entity class and related interfaces

import { DiceRollResult, GameStateResponse } from '../types/game';
import { ITimeService, timeService } from '../services/timeService';

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
  startingMoney: number;
  passGoMoney: number;
  jailFine: number;
  houseCost: number;
  hotelCost: number;
}

// Default game settings
export const DEFAULT_GAME_SETTINGS: GameSettings = {
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
  public static diceResult(): number {
    return Math.floor(Math.random() * 6) + 1;
  }
  public roomId: string;
  public gameId: string;
  public players: IPlayer[];
  public currentPlayer: number;
  public status: 'waiting' | 'active' | 'finished';
  public winner?: string;
  public maxPlayers: number;
  public hostId: string;
  public gameSettings: GameSettings;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(roomId: string, playerIds: string[], gameNumber: number = 1) {
    this.roomId = roomId;
    this.gameId = `${roomId}-g${gameNumber}`;
    this.currentPlayer = 0;
    this.status = 'waiting';
    this.maxPlayers = playerIds.length;
    this.hostId = playerIds[0] || '';
    this.gameSettings = DEFAULT_GAME_SETTINGS;
    this.createdAt = new Date();
    this.updatedAt = new Date();

    // Initialize players with starting values
    this.players = playerIds.map((playerId, index) => ({
      player_id: playerId,
      player_turn: index,
      position: 1,
      player_money: this.gameSettings.startingMoney,
      property_owns: [],
      utility_owns: [],
      transport_owns: [],
    }));
  }

  /**
   * Get current game state
   */
  getGameState(): GameStateResponse {
    return {
      current_turn: this.currentPlayer,
      players: this.players.map(player => ({
        player_id: player.player_id,
        player_turn: player.player_turn,
        position: player.position,
        player_money: player.player_money,
        property_owns: player.property_owns,
        utility_owns: player.utility_owns,
        transport_owns: player.transport_owns,
      })),
    };
  }

  /**
   * Update player position
   */
  updatePlayerPosition(playerId: string, diceTotal: number): number {
    const player = this.players.find(p => p.player_id === playerId);
    if (!player) throw new Error('Player not found');

    const newPosition = (player.position + diceTotal) % 40;
    player.position = newPosition;
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    this.updatedAt = new Date();

    return newPosition;
  }

  isPlayerTurn(playerId: string): boolean {
    const playerIndex = this.players.findIndex(p => p.player_id === playerId);
    return playerIndex === this.currentPlayer;
  }

  /**
   * Roll dice and update player position
   */
  rollDiceAndUpdatePosition(
    playerId: string,
    timeServiceInstance: ITimeService = timeService
  ): DiceRollResult {
    if (!this.isPlayerTurn(playerId)) {
      throw new Error("It's not the player's turn");
    }
    // Roll dice
    const { dice, total, double } = this.rollDice();
    const timestamp = timeServiceInstance.now();

    const newPosition = this.updatePlayerPosition(playerId, total);

    return {
      dice,
      total,
      timestamp,
      newPosition,
      double
    };
  }

  rollDice() {
    const dice: [number, number] = [
      Game.diceResult(),
      Game.diceResult(),
    ];
    console.log(dice, Game.diceResult(), Game.diceResult)
    const total = dice[0] + dice[1];
    const double = dice[0] === dice[1];
    return { dice, total, double };
  }
}
