import { RentManager, RentManagerError } from '../../../src/services/RentManager';
import { GameState, Phase, Action } from '../../../src/types/game';
import { IPlayer } from '../../../src/models/Game';

describe('RentManager', () => {
    let mockPlayers: IPlayer[];
    let mockGameState: GameState;

    beforeEach(() => {
        mockPlayers = [
            {
                player_id: 'player-1',
                player_turn: 0,
                position: 5,
                player_money: 1500,
                property_owns: [],
                utility_owns: [],
                transport_owns: [],
            },
            {
                player_id: 'player-2',
                player_turn: 1,
                position: 0,
                player_money: 1000,
                property_owns: [5],
                utility_owns: [],
                transport_owns: [],
            },
        ];


        mockGameState = {
            phase: Phase.END_TURN,
            players: mockPlayers,
            turn: { currentPlayerIndex: 0, round: 1 },
            currentTile: {
                index: 5,
                type: 'property',
                isOwned: true,
                ownerId: 'player-2',
                isOwnerCurrentPlayer: false,
                rentAmount: 50,
            },
            lastDice: { dice: [3, 4], total: 7, double: false },
            allowedActions: [Action.END_TURN],
        };
    });

    describe('chargeRent', () => {
        it('should deduct full rent from the current player', () => {
            const { state } = RentManager.chargeRent(mockGameState);
            expect(state.players[0]!.player_money).toBe(1500 - 50);
        });

        it('should credit the full rent amount to the owner', () => {
            const { state } = RentManager.chargeRent(mockGameState);
            expect(state.players[1]!.player_money).toBe(1000 + 50);
        });

        it('should return a RentEvent with correct payerId, ownerId, and amount', () => {
            const { event } = RentManager.chargeRent(mockGameState);
            expect(event.payerId).toBe('player-1');
            expect(event.ownerId).toBe('player-2');
            expect(event.amount).toBe(50);
        });

        it('should not mutate the original game state (immutability)', () => {
            RentManager.chargeRent(mockGameState);
            expect(mockGameState.players[0]!.player_money).toBe(1500);
            expect(mockGameState.players[1]!.player_money).toBe(1000);
        });

        it('should skip transfer and return amount 0 if rentAmount is 0', () => {
            mockGameState.currentTile!.rentAmount = 0;

            const { state, event } = RentManager.chargeRent(mockGameState);

            expect(state.players[0]!.player_money).toBe(1500);
            expect(state.players[1]!.player_money).toBe(1000);
            expect(event.amount).toBe(0);
        });

        it('should throw RentManagerError when currentTile is undefined', () => {
            mockGameState.currentTile = undefined;
            expect(() => RentManager.chargeRent(mockGameState)).toThrow(RentManagerError);
            expect(() => RentManager.chargeRent(mockGameState)).toThrow('No current tile to charge rent for');
        });

        it('should throw RentManagerError when tile is not owned', () => {
            mockGameState.currentTile = {
                index: 5,
                type: 'property',
                isOwned: false,
                price: 100,
            };
            expect(() => RentManager.chargeRent(mockGameState)).toThrow(RentManagerError);
            expect(() => RentManager.chargeRent(mockGameState)).toThrow('Tile is not owned by another player');
        });

        it('should throw RentManagerError when the owner player id is not found in the game', () => {
            mockGameState.currentTile!.ownerId = 'ghost-player';
            expect(() => RentManager.chargeRent(mockGameState)).toThrow(RentManagerError);
            expect(() => RentManager.chargeRent(mockGameState)).toThrow('not found in game');
        });
    });

    describe('calcPropertyRent', () => {
        it('should return the base rent (house level 0)', () => {
            const houseRent = new Map([['0', 14], ['1', 70], ['2', 200]]);
            expect(RentManager.calcPropertyRent(houseRent)).toBe(14);
        });

        it('should return 0 when house_rent is undefined', () => {
            expect(RentManager.calcPropertyRent(undefined)).toBe(0);
        });

        it('should return 0 when the level-0 key is missing', () => {
            const houseRent = new Map([['1', 70]]);
            expect(RentManager.calcPropertyRent(houseRent)).toBe(0);
        });
    });

    describe('calcTransportRent', () => {
        const transportRent = new Map([['1', 25], ['2', 50], ['3', 100], ['4', 200]]);

        it('should return rent based on how many transports the owner has (1)', () => {
            expect(RentManager.calcTransportRent(transportRent, 1)).toBe(25);
        });

        it('should return rent based on how many transports the owner has (2)', () => {
            expect(RentManager.calcTransportRent(transportRent, 2)).toBe(50);
        });

        it('should return rent based on how many transports the owner has (4)', () => {
            expect(RentManager.calcTransportRent(transportRent, 4)).toBe(200);
        });

        it('should return 0 when transport_rent is undefined', () => {
            expect(RentManager.calcTransportRent(undefined, 2)).toBe(0);
        });
    });

    describe('calcUtilityRent', () => {
        const utilityMultiplier = new Map([['1', 4], ['2', 10]]);

        it('should multiply dice total by multiplier for 1 utility owned', () => {
            expect(RentManager.calcUtilityRent(utilityMultiplier, 1, 7)).toBe(28);
        });

        it('should multiply dice total by multiplier for 2 utilities owned', () => {
            expect(RentManager.calcUtilityRent(utilityMultiplier, 2, 7)).toBe(70);
        });

        it('should return 0 when utility_rent_multiplier is undefined', () => {
            expect(RentManager.calcUtilityRent(undefined, 1, 7)).toBe(0);
        });
    });
});
