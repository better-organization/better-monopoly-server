import { TurnManager, TurnManagerError, ALLOWED_ACTIONS } from '../../../src/services/TurnManager';
import { GameState, Phase, Action } from '../../../src/types/game';
import { IPlayer } from '../../../src/models/Game';

describe('TurnManager', () => {
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
            {
                player_id: 'player-3',
                player_turn: 2,
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

    describe('getCurrentPlayerId', () => {
        it('should return the current player ID', () => {
            const playerId = TurnManager.getCurrentPlayerId(mockGameState);
            expect(playerId).toBe('player-1');
        });

        it('should return correct player ID for different indices', () => {
            mockGameState.turn.currentPlayerIndex = 1;
            expect(TurnManager.getCurrentPlayerId(mockGameState)).toBe('player-2');

            mockGameState.turn.currentPlayerIndex = 2;
            expect(TurnManager.getCurrentPlayerId(mockGameState)).toBe('player-3');
        });

        it('should handle index 0', () => {
            mockGameState.turn.currentPlayerIndex = 0;
            const playerId = TurnManager.getCurrentPlayerId(mockGameState);
            expect(playerId).toBe('player-1');
        });
    });

    describe('assertPlayerTurn', () => {
        it('should not throw error when it is the player\'s turn', () => {
            expect(() => {
                TurnManager.assertPlayerTurn(mockGameState, 'player-1');
            }).not.toThrow();
        });

        it('should throw TurnManagerError when it is not the player\'s turn', () => {
            expect(() => {
                TurnManager.assertPlayerTurn(mockGameState, 'player-2');
            }).toThrow(TurnManagerError);
        });

        it('should throw error with message "Not your turn"', () => {
            expect(() => {
                TurnManager.assertPlayerTurn(mockGameState, 'player-2');
            }).toThrow('Not your turn');
        });

        it('should work correctly after turn changes', () => {
            mockGameState.turn.currentPlayerIndex = 1;

            expect(() => {
                TurnManager.assertPlayerTurn(mockGameState, 'player-2');
            }).not.toThrow();

            expect(() => {
                TurnManager.assertPlayerTurn(mockGameState, 'player-1');
            }).toThrow(TurnManagerError);
        });

        it('should throw for non-existent player', () => {
            expect(() => {
                TurnManager.assertPlayerTurn(mockGameState, 'non-existent-player');
            }).toThrow(TurnManagerError);
        });
    });

    describe('assertPhase', () => {
        it('should not throw when action is allowed in current phase', () => {
            mockGameState.phase = Phase.ROLL_DICE;
            expect(() => {
                TurnManager.assertPhase(mockGameState, Action.ROLL_DICE);
            }).not.toThrow();
        });

        it('should throw TurnManagerError when action is not allowed', () => {
            mockGameState.phase = Phase.ROLL_DICE;
            expect(() => {
                TurnManager.assertPhase(mockGameState, Action.MOVE_PLAYER);
            }).toThrow(TurnManagerError);
        });

        it('should throw error with descriptive message', () => {
            mockGameState.phase = Phase.ROLL_DICE;
            expect(() => {
                TurnManager.assertPhase(mockGameState, Action.END_TURN);
            }).toThrow(`Action ${Action.END_TURN} not allowed in phase ${Phase.ROLL_DICE}`);
        });

        it('should validate MOVE_PLAYER action in MOVE_PLAYER phase', () => {
            mockGameState.phase = Phase.MOVE_PLAYER;
            expect(() => {
                TurnManager.assertPhase(mockGameState, Action.MOVE_PLAYER);
            }).not.toThrow();
        });

        it('should validate END_TURN action in END_TURN phase', () => {
            mockGameState.phase = Phase.END_TURN;
            expect(() => {
                TurnManager.assertPhase(mockGameState, Action.END_TURN);
            }).not.toThrow();
        });

        it('should validate RESOLVE_TILE action in RESOLVE_TILE phase', () => {
            mockGameState.phase = Phase.RESOLVE_TILE;
            expect(() => {
                TurnManager.assertPhase(mockGameState, Action.RESOLVE_TILE);
            }).not.toThrow();
        });

        it('should allow no actions in GAME_OVER phase', () => {
            mockGameState.phase = Phase.GAME_OVER;
            expect(() => {
                TurnManager.assertPhase(mockGameState, Action.ROLL_DICE);
            }).toThrow(TurnManagerError);
        });
    });

    describe('allowedActions', () => {
        it('should return allowed actions for ROLL_DICE phase', () => {
            const actions = TurnManager.allowedActions(Phase.ROLL_DICE);
            expect(actions).toEqual([Action.ROLL_DICE]);
        });

        it('should return allowed actions for MOVE_PLAYER phase', () => {
            const actions = TurnManager.allowedActions(Phase.MOVE_PLAYER);
            expect(actions).toEqual([Action.MOVE_PLAYER]);
        });

        it('should return allowed actions for RESOLVE_TILE phase', () => {
            const actions = TurnManager.allowedActions(Phase.RESOLVE_TILE);
            expect(actions).toEqual([Action.RESOLVE_TILE]);
        });

        it('should return allowed actions for END_TURN phase', () => {
            const actions = TurnManager.allowedActions(Phase.END_TURN);
            expect(actions).toEqual([Action.END_TURN]);
        });

        it('should return empty array for GAME_OVER phase', () => {
            const actions = TurnManager.allowedActions(Phase.GAME_OVER);
            expect(actions).toEqual([]);
        });

        it('should return array for each phase', () => {
            Object.values(Phase).forEach(phase => {
                const actions = TurnManager.allowedActions(phase);
                expect(Array.isArray(actions)).toBe(true);
            });
        });
    });

    describe('nextPhase', () => {
        it('should transition from ROLL_DICE to MOVE_PLAYER', () => {
            mockGameState.phase = Phase.ROLL_DICE;
            const newState = TurnManager.nextPhase(mockGameState);

            expect(newState.phase).toBe(Phase.MOVE_PLAYER);
            expect(newState).not.toBe(mockGameState); // Should return new object
        });

        it('should transition from MOVE_PLAYER to END_TURN', () => {
            mockGameState.phase = Phase.MOVE_PLAYER;
            const newState = TurnManager.nextPhase(mockGameState);

            expect(newState.phase).toBe(Phase.END_TURN);
        });

        it('should transition from END_TURN to ROLL_DICE', () => {
            mockGameState.phase = Phase.END_TURN;
            const newState = TurnManager.nextPhase(mockGameState);

            expect(newState.phase).toBe(Phase.ROLL_DICE);
        });

        it('should stay in GAME_OVER phase', () => {
            mockGameState.phase = Phase.GAME_OVER;
            const newState = TurnManager.nextPhase(mockGameState);

            expect(newState.phase).toBe(Phase.GAME_OVER);
        });

        it('should stay in RESOLVE_TILE phase', () => {
            mockGameState.phase = Phase.RESOLVE_TILE;
            const newState = TurnManager.nextPhase(mockGameState);

            expect(newState.phase).toBe(Phase.RESOLVE_TILE);
        });

        it('should not modify original state', () => {
            mockGameState.phase = Phase.ROLL_DICE;
            const originalPhase = mockGameState.phase;

            TurnManager.nextPhase(mockGameState);

            expect(mockGameState.phase).toBe(originalPhase);
        });
    });

    describe('nextTurn', () => {
        let turnManager: TurnManager;

        beforeEach(() => {
            turnManager = new TurnManager();
        });

        it('should advance to next player', () => {
            const newState = turnManager.nextTurn(mockGameState);

            expect(newState.turn.currentPlayerIndex).toBe(1);
            expect(newState.turn.round).toBe(1); // Round should not increment
        });

        it('should wrap around to first player after last player', () => {
            mockGameState.turn.currentPlayerIndex = 2; // Last player

            const newState = turnManager.nextTurn(mockGameState);

            expect(newState.turn.currentPlayerIndex).toBe(0);
        });

        it('should increment round when wrapping to first player', () => {
            mockGameState.turn.currentPlayerIndex = 2; // Last player
            mockGameState.turn.round = 1;

            const newState = turnManager.nextTurn(mockGameState);

            expect(newState.turn.currentPlayerIndex).toBe(0);
            expect(newState.turn.round).toBe(2);
        });

        it('should not increment round when not wrapping', () => {
            mockGameState.turn.currentPlayerIndex = 0;
            mockGameState.turn.round = 3;

            const newState = turnManager.nextTurn(mockGameState);

            expect(newState.turn.currentPlayerIndex).toBe(1);
            expect(newState.turn.round).toBe(3); // Should stay the same
        });

        it('should reset phase to ROLL_DICE', () => {
            mockGameState.phase = Phase.END_TURN;

            const newState = turnManager.nextTurn(mockGameState);

            expect(newState.phase).toBe(Phase.ROLL_DICE);
        });

        it('should not modify original state', () => {
            const originalIndex = mockGameState.turn.currentPlayerIndex;
            const originalRound = mockGameState.turn.round;
            const originalPhase = mockGameState.phase;

            turnManager.nextTurn(mockGameState);

            expect(mockGameState.turn.currentPlayerIndex).toBe(originalIndex);
            expect(mockGameState.turn.round).toBe(originalRound);
            expect(mockGameState.phase).toBe(originalPhase);
        });

        it('should work with 2 players', () => {
            mockGameState.players = mockPlayers.slice(0, 2);
            mockGameState.turn.currentPlayerIndex = 0;

            const state1 = turnManager.nextTurn(mockGameState);
            expect(state1.turn.currentPlayerIndex).toBe(1);
            expect(state1.turn.round).toBe(1);

            const state2 = turnManager.nextTurn(state1);
            expect(state2.turn.currentPlayerIndex).toBe(0);
            expect(state2.turn.round).toBe(2);
        });

        it('should work with 4 players', () => {
            const player4: IPlayer = {
                player_id: 'player-4',
                player_turn: 3,
                position: 0,
                player_money: 1500,
                property_owns: [],
                utility_owns: [],
                transport_owns: [],
            };
            mockGameState.players = [...mockPlayers, player4];
            mockGameState.turn.currentPlayerIndex = 2;

            const newState = turnManager.nextTurn(mockGameState);

            expect(newState.turn.currentPlayerIndex).toBe(3);
            expect(newState.turn.round).toBe(1);
        });

        it('should preserve player data', () => {
            const newState = turnManager.nextTurn(mockGameState);

            expect(newState.players).toBe(mockGameState.players);
        });
    });

    describe('ALLOWED_ACTIONS constant', () => {
        it('should have actions defined for all phases', () => {
            Object.values(Phase).forEach(phase => {
                expect(ALLOWED_ACTIONS).toHaveProperty(phase);
            });
        });

        it('should have correct structure', () => {
            expect(ALLOWED_ACTIONS[Phase.ROLL_DICE]).toEqual([Action.ROLL_DICE]);
            expect(ALLOWED_ACTIONS[Phase.MOVE_PLAYER]).toEqual([Action.MOVE_PLAYER]);
            expect(ALLOWED_ACTIONS[Phase.RESOLVE_TILE]).toEqual([Action.RESOLVE_TILE]);
            expect(ALLOWED_ACTIONS[Phase.END_TURN]).toEqual([Action.END_TURN]);
            expect(ALLOWED_ACTIONS[Phase.GAME_OVER]).toEqual([]);
        });
    });

    describe('TurnManagerError', () => {
        it('should be an instance of Error', () => {
            const error = new TurnManagerError('Test error');
            expect(error).toBeInstanceOf(Error);
        });

        it('should have correct name', () => {
            const error = new TurnManagerError('Test error');
            expect(error.name).toBe('TurnManagerError');
        });

        it('should preserve error message', () => {
            const message = 'Custom error message';
            const error = new TurnManagerError(message);
            expect(error.message).toBe(message);
        });
    });
});

