import { GameService } from '../../../src/services/gameService';
import { ITimeService } from '../../../src/services/timeService';

describe('GameService', () => {
    describe('rollDice', () => {
        let mockTimeService: ITimeService;
        const fixedDate = new Date('2026-01-11T13:34:17.000Z');

        beforeEach(() => {
            mockTimeService = {
                now: jest.fn().mockReturnValue(fixedDate),
            };
        });

        it('should return a DiceRollResult object', () => {
            const result = GameService.rollDice(mockTimeService);

            expect(result).toHaveProperty('dice');
            expect(result).toHaveProperty('total');
            expect(result).toHaveProperty('timestamp');
        });

        it('should return dice values between 1 and 6', () => {
            // Test multiple times to ensure randomness is within range
            for (let i = 0; i < 100; i++) {
                const result = GameService.rollDice(mockTimeService);
                expect(result.dice[0]).toBeGreaterThanOrEqual(1);
                expect(result.dice[0]).toBeLessThanOrEqual(6);
                expect(result.dice[1]).toBeGreaterThanOrEqual(1);
                expect(result.dice[1]).toBeLessThanOrEqual(6);
            }
        });

        it('should return correct total as sum of dice', () => {
            const result = GameService.rollDice(mockTimeService);
            const expectedTotal = result.dice[0] + result.dice[1];
            expect(result.total).toBe(expectedTotal);
        });

        it('should return total between 2 and 12', () => {
            // Test multiple times
            for (let i = 0; i < 100; i++) {
                const result = GameService.rollDice(mockTimeService);
                expect(result.total).toBeGreaterThanOrEqual(2);
                expect(result.total).toBeLessThanOrEqual(12);
            }
        });

        it('should return a valid timestamp from timeService', () => {
            const result = GameService.rollDice(mockTimeService);
            expect(result.timestamp).toBeInstanceOf(Date);
            expect(result.timestamp).toBe(fixedDate);
            expect(mockTimeService.now).toHaveBeenCalledTimes(1);
        });

        it('should use default timeService when no parameter provided', () => {
            const result = GameService.rollDice();
            expect(result.timestamp).toBeInstanceOf(Date);
            expect(result.timestamp.getTime()).toBeLessThanOrEqual(Date.now());
        });

        it('should return dice as a tuple of two numbers', () => {
            const result = GameService.rollDice(mockTimeService);
            expect(Array.isArray(result.dice)).toBe(true);
            expect(result.dice.length).toBe(2);
            expect(typeof result.dice[0]).toBe('number');
            expect(typeof result.dice[1]).toBe('number');
        });
    });
});
