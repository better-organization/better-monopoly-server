// Time Service for dependency injection
// Allows mocking of Date/time in tests

export interface ITimeService {
  now(): Date;
}

export class TimeService implements ITimeService {
  now(): Date {
    return new Date();
  }
}

// Singleton instance
export const timeService = new TimeService();
