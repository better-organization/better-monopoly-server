import { GameState, RentEvent } from '../types/game';
import { GameStateManager } from './GameStateManager';

export class RentManagerError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RentManagerError';
    }
}

export class RentManager {
    /**
     * Calculate and transfer rent from the current (landing) player to the tile owner.
     * Returns both the updated state and a RentEvent for the API response.
     */
    static chargeRent(gameState: GameState): { state: GameState; event: RentEvent } {
        const { currentTile, players, turn } = gameState;

        if (!currentTile) {
            throw new RentManagerError('No current tile to charge rent for');
        }

        if (!currentTile.isOwned || !currentTile.ownerId) {
            throw new RentManagerError('Tile is not owned by another player');
        }

        const rentAmount = currentTile.rentAmount ?? 0;

        if (rentAmount <= 0) {
            const event: RentEvent = {
                payerId: players[turn.currentPlayerIndex]!.player_id,
                ownerId: currentTile.ownerId,
                amount: 0,
            };
            return { state: gameState, event };
        }

        const currentPlayerIndex = turn.currentPlayerIndex;
        const ownerIndex = players.findIndex(
            p => p.player_id === currentTile.ownerId
        );

        if (ownerIndex === -1) {
            throw new RentManagerError(`Owner ${currentTile.ownerId} not found in game`);
        }

        // Deduct rent from payer (cap at player's current balance — no bankruptcy logic yet)
        const payer = players[currentPlayerIndex]!;
        const actualRent = rentAmount;

        const event: RentEvent = {
            payerId: payer.player_id,
            ownerId: currentTile.ownerId,
            amount: actualRent,
        };

        let updatedState = GameStateManager.changePlayerInfo(
            gameState,
            { player_money: payer.player_money - actualRent },
            currentPlayerIndex
        );

        const owner = updatedState.players[ownerIndex]!;
        updatedState = GameStateManager.changePlayerInfo(
            updatedState,
            { player_money: owner.player_money + actualRent },
            ownerIndex
        );

        console.log(
            `Rent charged: ${payer.player_id} paid €${actualRent} to ${currentTile.ownerId}`
        );

        return { state: updatedState, event };
    }

    /**
     * Calculate base property rent (house level 0 = no houses).
     */
    static calcPropertyRent(
        houseRent: Map<string, number> | undefined
    ): number {
        if (!houseRent) return 0;
        const rent = houseRent.get('0');
        return rent ?? 0;
    }

    /**
     * Calculate transport rent based on how many transports the owner holds.
     */
    static calcTransportRent(
        transportRent: Map<string, number> | undefined,
        ownerTransportCount: number
    ): number {
        if (!transportRent) return 0;
        const rent = transportRent.get(String(ownerTransportCount));
        return rent ?? 0;
    }

    /**
     * Calculate utility rent: dice total × multiplier based on how many utilities the owner holds.
     */
    static calcUtilityRent(
        utilityRentMultiplier: Map<string, number> | undefined,
        ownerUtilityCount: number,
        diceTotal: number
    ): number {
        if (!utilityRentMultiplier) return 0;
        const multiplier = utilityRentMultiplier.get(String(ownerUtilityCount));
        return (multiplier ?? 0) * diceTotal;
    }
}
