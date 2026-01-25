// Game Model
// Game entity class and related interfaces

import { DiceRollResult, GameStateResponse } from '../types/game';
import { ITimeService, timeService } from '../services/timeService';
import { randomUUID } from 'node:crypto';

// Player interface
export interface IPlayer {
  user_id: string;
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
  public gameId: string;
  public roomId: string;
  public players: IPlayer[];
  public currentPlayer: number;
  public status: 'waiting' | 'active' | 'finished';
  public winner?: string;
  public maxPlayers: number;
  public hostId: string;
  public gameSettings: GameSettings;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(roomId: string, players: string[], gameId: string = randomUUID()) {
    this.gameId = gameId;
    this.roomId = roomId;
    this.currentPlayer = 0;
    this.status = 'waiting';
    this.maxPlayers = players.length;
    this.hostId = players[0] || '';
    this.gameSettings = DEFAULT_GAME_SETTINGS;
    this.createdAt = new Date();
    this.updatedAt = new Date();

    // Initialize players with starting values
    this.players = players.map((userId, index) => ({
      user_id: userId,
      player_turn: index + 1,
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
  getState(): GameStateResponse {
    return {
      players: this.players.map(player => ({
        user_id: player.user_id,
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
  updatePlayerPosition(userId: string, diceTotal: number): number {
    const player = this.players.find(p => p.user_id === userId);
    if (!player) throw new Error('Player not found');

    // Calculate new position (wrap around at 40)
    const newPosition = (player.position + diceTotal) % 40;
    player.position = newPosition;
    this.updatedAt = new Date();

    return newPosition;
  }

  /**
   * Roll dice and update player position
   */
  rollDiceAndUpdatePosition(
    userId: string,
    timeServiceInstance: ITimeService = timeService
  ): DiceRollResult {
    // Roll dice
    const dice: [number, number] = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ];
    const total = dice[0] + dice[1];
    const timestamp = timeServiceInstance.now();

    // Update position
    const newPosition = this.updatePlayerPosition(userId, total);

    const diceResult: DiceRollResult = {
      dice,
      total,
      timestamp,
      newPosition,
    };

    return diceResult;
  }
}
