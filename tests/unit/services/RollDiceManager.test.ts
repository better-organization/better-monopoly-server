import { RollDiceManager, RollDiceManagerError } from '../../../src/services/RollDiceManager';
import { GameState, Phase, Action } from '../../../src/types/game';
import { IPlayer } from '../../../src/models/Game';

describe('RollDiceManager', () => {
    let mockGameState: GameState;
    let mockPlayers: IPlayer[];

    beforeEach(() => {
        mockPlayers = [
            {
                player_id: 'player-1',
                player_turn: 0,
                position: 0,
                player_money: 1500,
                property_owns: [],
                utility_owns: [],
                transport_owns: [],
            },
            {
                player_id: 'player-2',
                player_turn: 1,
                position: 0,
                player_money: 1500,
                property_owns: [],
                utility_owns: [],
                transport_owns: [],
            },
        ];

        mockGameState = {
            phase: Phase.ROLL_DICE,
            players: mockPlayers,
            turn: {
                currentPlayerIndex: 0,
                round: 1,
            },
            lastDice: undefined,
            allowedActions: [Action.ROLL_DICE],
        };
    });

    describe('diceResult', () => {
        it('should return a number between 1 and 6', () => {
            const result = RollDiceManager.diceResult();
            expect(result).toBeGreaterThanOrEqual(1);
            expect(result).toBeLessThanOrEqual(6);
        });

        it('should return an integer', () => {
            const result = RollDiceManager.diceResult();
            expect(Number.isInteger(result)).toBe(true);
        });

        it('should eventually produce different values', () => {
            const results = new Set();
            for (let i = 0; i < 10; i++) {
                results.add(RollDiceManager.diceResult());
            }
            expect(results.size).toBeGreaterThanOrEqual(2);
        });
    });

    describe('rollDice', () => {
        it('should roll dice and return updated state with lastDice', () => {
            const newState = RollDiceManager.rollDice(mockGameState);

            expect(newState.lastDice).toBeDefined();
            expect(newState.lastDice?.dice).toHaveLength(2);
            expect(newState.lastDice?.dice[0]).toBeGreaterThanOrEqual(1);
            expect(newState.lastDice?.dice[0]).toBeLessThanOrEqual(6);
            expect(newState.lastDice?.dice[1]).toBeGreaterThanOrEqual(1);
            expect(newState.lastDice?.dice[1]).toBeLessThanOrEqual(6);
        });

        it('should calculate correct total', () => {
            const mockDiceRoller = jest.fn()
                .mockReturnValueOnce(3)
                .mockReturnValueOnce(5);

            const newState = RollDiceManager.rollDice(mockGameState, mockDiceRoller);

            expect(newState.lastDice?.dice).toEqual([3, 5]);
            expect(newState.lastDice?.total).toBe(8);
        });

        it('should detect doubles when dice values match', () => {
            const mockDiceRoller = jest.fn()
                .mockReturnValueOnce(4)
                .mockReturnValueOnce(4);

            const newState = RollDiceManager.rollDice(mockGameState, mockDiceRoller);

            expect(newState.lastDice?.dice).toEqual([4, 4]);
            expect(newState.lastDice?.double).toBe(true);
        });

        it('should set double to false when dice values differ', () => {
            const mockDiceRoller = jest.fn()
                .mockReturnValueOnce(2)
                .mockReturnValueOnce(6);

            const newState = RollDiceManager.rollDice(mockGameState, mockDiceRoller);

            expect(newState.lastDice?.dice).toEqual([2, 6]);
            expect(newState.lastDice?.double).toBe(false);
        });

        it('should not modify original state', () => {
            const originalState = { ...mockGameState };

            RollDiceManager.rollDice(mockGameState);

            expect(mockGameState).toEqual(originalState);
        });

        it('should preserve other state properties', () => {
            const newState = RollDiceManager.rollDice(mockGameState);

            expect(newState.phase).toBe(mockGameState.phase);
            expect(newState.players).toBe(mockGameState.players);
            expect(newState.turn).toBe(mockGameState.turn);
            expect(newState.allowedActions).toBe(mockGameState.allowedActions);
        });

        it('should throw RollDiceManagerError when not in ROLL_DICE phase', () => {
            mockGameState.phase = Phase.MOVE_PLAYER;

            expect(() => {
                RollDiceManager.rollDice(mockGameState);
            }).toThrow(RollDiceManagerError);
        });

        it('should throw error with descriptive message for wrong phase', () => {
            mockGameState.phase = Phase.MOVE_PLAYER;

            expect(() => {
                RollDiceManager.rollDice(mockGameState);
            }).toThrow(`Cannot roll dice in phase ${Phase.MOVE_PLAYER}`);
        });

        it('should not allow rolling dice in END_TURN phase', () => {
            mockGameState.phase = Phase.END_TURN;

            expect(() => {
                RollDiceManager.rollDice(mockGameState);
            }).toThrow(RollDiceManagerError);
        });

        it('should not allow rolling dice in RESOLVE_TILE phase', () => {
            mockGameState.phase = Phase.RESOLVE_TILE;

            expect(() => {
                RollDiceManager.rollDice(mockGameState);
            }).toThrow(RollDiceManagerError);
        });

        it('should not allow rolling dice in GAME_OVER phase', () => {
            mockGameState.phase = Phase.GAME_OVER;

            expect(() => {
                RollDiceManager.rollDice(mockGameState);
            }).toThrow(RollDiceManagerError);
        });

        it('should use custom dice roller when provided', () => {
            const customRoller = jest.fn()
                .mockReturnValueOnce(1)
                .mockReturnValueOnce(6);

            const newState = RollDiceManager.rollDice(mockGameState, customRoller);

            expect(customRoller).toHaveBeenCalledTimes(2);
            expect(newState.lastDice?.dice).toEqual([1, 6]);
        });

        it('should use default diceResult when no roller provided', () => {
            const newState = RollDiceManager.rollDice(mockGameState);

            // Should produce valid dice results
            expect(newState.lastDice?.dice[0]).toBeGreaterThanOrEqual(1);
            expect(newState.lastDice?.dice[0]).toBeLessThanOrEqual(6);
            expect(newState.lastDice?.dice[1]).toBeGreaterThanOrEqual(1);
            expect(newState.lastDice?.dice[1]).toBeLessThanOrEqual(6);
        });

        it('should handle maximum dice values', () => {
            const mockDiceRoller = jest.fn()
                .mockReturnValueOnce(6)
                .mockReturnValueOnce(6);

            const newState = RollDiceManager.rollDice(mockGameState, mockDiceRoller);

            expect(newState.lastDice?.dice).toEqual([6, 6]);
            expect(newState.lastDice?.total).toBe(12);
            expect(newState.lastDice?.double).toBe(true);
        });

        it('should handle minimum dice values', () => {
            const mockDiceRoller = jest.fn()
                .mockReturnValueOnce(1)
                .mockReturnValueOnce(1);

            const newState = RollDiceManager.rollDice(mockGameState, mockDiceRoller);

            expect(newState.lastDice?.dice).toEqual([1, 1]);
            expect(newState.lastDice?.total).toBe(2);
            expect(newState.lastDice?.double).toBe(true);
        });

        it('should overwrite previous lastDice if it exists', () => {
            mockGameState.lastDice = {
                dice: [3, 3],
                total: 6,
                double: true,
            };

            const mockDiceRoller = jest.fn()
                .mockReturnValueOnce(2)
                .mockReturnValueOnce(5);

            const newState = RollDiceManager.rollDice(mockGameState, mockDiceRoller);

            expect(newState.lastDice?.dice).toEqual([2, 5]);
            expect(newState.lastDice?.total).toBe(7);
            expect(newState.lastDice?.double).toBe(false);
        });

        it('should produce different results on multiple calls', () => {
            const results: number[][] = [];

            // Roll dice multiple times and collect results
            for (let i = 0; i < 10; i++) {
                const newState = RollDiceManager.rollDice(mockGameState);
                results.push([...newState.lastDice!.dice]);
            }

            // At least some results should be different
            const uniqueResults = new Set(results.map(r => r.join(',')));
            expect(uniqueResults.size).toBeGreaterThan(1);
        });
    });

    describe('RollDiceManagerError', () => {
        it('should be an instance of Error', () => {
            const error = new RollDiceManagerError('Test error');
            expect(error).toBeInstanceOf(Error);
        });

        it('should have correct name', () => {
            const error = new RollDiceManagerError('Test error');
            expect(error.name).toBe('RollDiceManagerError');
        });

        it('should preserve error message', () => {
            const message = 'Custom error message';
            const error = new RollDiceManagerError(message);
            expect(error.message).toBe(message);
        });
    });
});

