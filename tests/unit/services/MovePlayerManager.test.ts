import { MovePlayerManager, MovePlayerManagerError } from '../../../src/services/MovePlayerManager';
import { GameState, Phase, Action } from '../../../src/types/game';
import { IPlayer } from '../../../src/models/Game';

describe('MovePlayerManager', () => {
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
                position: 5,
                player_money: 1500,
                property_owns: [],
                utility_owns: [],
                transport_owns: [],
            },
            {
                player_id: 'player-3',
                player_turn: 2,
                position: 10,
                player_money: 1500,
                property_owns: [],
                utility_owns: [],
                transport_owns: [],
            },
        ];

        mockGameState = {
            phase: Phase.MOVE_PLAYER,
            players: mockPlayers,
            turn: {
                currentPlayerIndex: 0,
                round: 1,
            },
            lastDice: {
                dice: [3, 4],
                total: 7,
                double: false,
            },
            allowedActions: [Action.MOVE_PLAYER],
        };
    });

    describe('movePlayer', () => {
        it('should move current player by dice total', () => {
            mockGameState.lastDice = {
                dice: [3, 4],
                total: 7,
                double: false,
            };
            const newState = MovePlayerManager.movePlayer(mockGameState);

            expect(newState.players[0]!.position).toBe(7); // 0 + 7
        });

        it('should not modify other players positions', () => {
            const newState = MovePlayerManager.movePlayer(mockGameState);

            expect(newState.players[1]!.position).toBe(5); // Unchanged
            expect(newState.players[2]!.position).toBe(10); // Unchanged
        });

        it('should wrap around the board at position 40', () => {
            mockGameState.players[0]!.position = 38;
            mockGameState.lastDice = {
                dice: [2, 3],
                total: 5,
                double: false,
            };

            const newState = MovePlayerManager.movePlayer(mockGameState);

            expect(newState.players[0]!.position).toBe(3); // (38 + 5) % 40 = 3
        });

        it('should handle exact wrap at position 40', () => {
            mockGameState.players[0]!.position = 35;
            mockGameState.lastDice = {
                dice: [2, 3],
                total: 5,
                double: false,
            };

            const newState = MovePlayerManager.movePlayer(mockGameState);

            expect(newState.players[0]!.position).toBe(0); // (35 + 5) % 40 = 0
        });

        it('should handle landing exactly on position 40 (wraps to 0)', () => {
            mockGameState.players[0]!.position = 30;
            mockGameState.lastDice = {
                dice: [5, 5],
                total: 10,
                double: true,
            };

            const newState = MovePlayerManager.movePlayer(mockGameState);

            expect(newState.players[0]!.position).toBe(0); // (30 + 10) % 40 = 0
        });

        it('should move different players correctly', () => {
            mockGameState.turn.currentPlayerIndex = 1; // Player 2
            mockGameState.lastDice = {
                dice: [4, 2],
                total: 6,
                double: false,
            };

            const newState = MovePlayerManager.movePlayer(mockGameState);

            expect(newState.players[1]!.position).toBe(11); // 5 + 6
            expect(newState.players[0]!.position).toBe(0); // Unchanged
        });

        it('should handle maximum dice roll (12)', () => {
            mockGameState.lastDice = {
                dice: [6, 6],
                total: 12,
                double: true,
            };

            const newState = MovePlayerManager.movePlayer(mockGameState);

            expect(newState.players[0]!.position).toBe(12);
        });

        it('should handle minimum dice roll (2)', () => {
            mockGameState.lastDice = {
                dice: [1, 1],
                total: 2,
                double: true,
            };

            const newState = MovePlayerManager.movePlayer(mockGameState);

            expect(newState.players[0]!.position).toBe(2);
        });

        it('should return new state object', () => {
            const newState = MovePlayerManager.movePlayer(mockGameState);

            expect(newState).not.toBe(mockGameState);
        });

        it('should return new players array', () => {
            const newState = MovePlayerManager.movePlayer(mockGameState);

            expect(newState.players).not.toBe(mockGameState.players);
        });

        it('should preserve other state properties', () => {
            const newState = MovePlayerManager.movePlayer(mockGameState);

            expect(newState.phase).toBe(mockGameState.phase);
            expect(newState.turn).toBe(mockGameState.turn);
            expect(newState.lastDice).toBe(mockGameState.lastDice);
            expect(newState.allowedActions).toBe(mockGameState.allowedActions);
        });

        it('should throw MovePlayerManagerError when not in MOVE_PLAYER phase', () => {
            mockGameState.phase = Phase.ROLL_DICE;

            expect(() => {
                MovePlayerManager.movePlayer(mockGameState);
            }).toThrow(MovePlayerManagerError);
        });

        it('should throw error with descriptive message for wrong phase', () => {
            mockGameState.phase = Phase.END_TURN;

            expect(() => {
                MovePlayerManager.movePlayer(mockGameState);
            }).toThrow(`Cannot move player in phase ${Phase.END_TURN}`);
        });

        it('should throw error when lastDice is undefined', () => {
            mockGameState.lastDice = undefined;

            expect(() => {
                MovePlayerManager.movePlayer(mockGameState);
            }).toThrow(MovePlayerManagerError);
        });

        it('should throw error with message about missing dice roll', () => {
            mockGameState.lastDice = undefined;

            expect(() => {
                MovePlayerManager.movePlayer(mockGameState);
            }).toThrow('Cannot move player without dice roll');
        });

        it('should not allow moving in ROLL_DICE phase', () => {
            mockGameState.phase = Phase.ROLL_DICE;

            expect(() => {
                MovePlayerManager.movePlayer(mockGameState);
            }).toThrow(MovePlayerManagerError);
        });

        it('should not allow moving in RESOLVE_TILE phase', () => {
            mockGameState.phase = Phase.RESOLVE_TILE;

            expect(() => {
                MovePlayerManager.movePlayer(mockGameState);
            }).toThrow(MovePlayerManagerError);
        });

        it('should not allow moving in GAME_OVER phase', () => {
            mockGameState.phase = Phase.GAME_OVER;

            expect(() => {
                MovePlayerManager.movePlayer(mockGameState);
            }).toThrow(MovePlayerManagerError);
        });

        it('should handle player starting at various positions', () => {
            const testCases = [
                { start: 0, dice: 7, expected: 7 },
                { start: 10, dice: 5, expected: 15 },
                { start: 20, dice: 8, expected: 28 },
                { start: 35, dice: 3, expected: 38 },
                { start: 38, dice: 5, expected: 3 },
                { start: 39, dice: 2, expected: 1 },
            ];

            testCases.forEach(({ start, dice, expected }) => {
                mockGameState.players[0]!.position = start;
                mockGameState.lastDice = {
                    dice: [Math.floor(dice / 2), Math.ceil(dice / 2)] as [number, number],
                    total: dice,
                    double: false,
                };

                const newState = MovePlayerManager.movePlayer(mockGameState);
                expect(newState.players[0]!.position).toBe(expected);
            });
        });

        it('should preserve all player properties except position', () => {
            const originalPlayer = { ...mockGameState.players[0]! };

            const newState = MovePlayerManager.movePlayer(mockGameState);

            expect(newState.players[0]!.player_id).toBe(originalPlayer.player_id);
            expect(newState.players[0]!.player_turn).toBe(originalPlayer.player_turn);
            expect(newState.players[0]!.player_money).toBe(originalPlayer.player_money);
            expect(newState.players[0]!.property_owns).toEqual(originalPlayer.property_owns);
            expect(newState.players[0]!.utility_owns).toEqual(originalPlayer.utility_owns);
            expect(newState.players[0]!.transport_owns).toEqual(originalPlayer.transport_owns);
        });

        it('should handle moving player with properties', () => {
            mockGameState.players[0]!.property_owns = ['property1', 'property2'];
            mockGameState.players[0]!.utility_owns = ['utility1'];
            mockGameState.players[0]!.transport_owns = ['transport1'];

            const newState = MovePlayerManager.movePlayer(mockGameState);

            expect(newState.players[0]!.position).toBe(7);
            expect(newState.players[0]!.property_owns).toEqual(['property1', 'property2']);
            expect(newState.players[0]!.utility_owns).toEqual(['utility1']);
            expect(newState.players[0]!.transport_owns).toEqual(['transport1']);
        });
    });

    describe('currentPlayerPosition', () => {
        it('should return current player position', () => {
            const position = MovePlayerManager.currentPlayerPosition(mockGameState);
            expect(position).toBe(0);
        });

        it('should return correct position for different players', () => {
            mockGameState.turn.currentPlayerIndex = 1;
            expect(MovePlayerManager.currentPlayerPosition(mockGameState)).toBe(5);

            mockGameState.turn.currentPlayerIndex = 2;
            expect(MovePlayerManager.currentPlayerPosition(mockGameState)).toBe(10);
        });

        it('should return updated position after move', () => {
            const newState = MovePlayerManager.movePlayer(mockGameState);
            const position = MovePlayerManager.currentPlayerPosition(newState);

            expect(position).toBe(7);
        });

        it('should work with wrapped positions', () => {
            mockGameState.players[0]!.position = 38;
            const position = MovePlayerManager.currentPlayerPosition(mockGameState);

            expect(position).toBe(38);
        });

        it('should handle position 0', () => {
            mockGameState.players[0]!.position = 0;
            const position = MovePlayerManager.currentPlayerPosition(mockGameState);

            expect(position).toBe(0);
        });

        it('should handle position 39', () => {
            mockGameState.players[0]!.position = 39;
            const position = MovePlayerManager.currentPlayerPosition(mockGameState);

            expect(position).toBe(39);
        });

        it('should work in different phases', () => {
            mockGameState.phase = Phase.ROLL_DICE;
            expect(MovePlayerManager.currentPlayerPosition(mockGameState)).toBe(0);

            mockGameState.phase = Phase.END_TURN;
            expect(MovePlayerManager.currentPlayerPosition(mockGameState)).toBe(0);
        });

        it('should work with different turn indices', () => {
            for (let i = 0; i < mockGameState.players.length; i++) {
                mockGameState.turn.currentPlayerIndex = i;
                const position = MovePlayerManager.currentPlayerPosition(mockGameState);
                expect(position).toBe(mockGameState.players[i]!.position);
            }
        });
    });

    describe('MovePlayerManagerError', () => {
        it('should be an instance of Error', () => {
            const error = new MovePlayerManagerError('Test error');
            expect(error).toBeInstanceOf(Error);
        });

        it('should have correct name', () => {
            const error = new MovePlayerManagerError('Test error');
            expect(error.name).toBe('MovePlayerManagerError');
        });

        it('should preserve error message', () => {
            const message = 'Custom error message';
            const error = new MovePlayerManagerError(message);
            expect(error.message).toBe(message);
        });
    });
});

