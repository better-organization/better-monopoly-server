import { AppError, errorHandler } from '../../../src/middlewares/errorHandler';
import { notFoundHandler } from '../../../src/middlewares/notFoundHandler';
import { logger } from '../../../src/utils/logger';
import { Request, Response, NextFunction } from 'express';

describe('Error Handler Middleware', () => {
  it('should create an AppError with correct properties', () => {
    const error = new AppError(400, 'Bad Request');

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Bad Request');
    expect(error.isOperational).toBe(true);
  });

  it('should log errors properly', () => {
    const spy = jest.spyOn(logger, 'info');
    logger.info('Test log message');
    expect(spy).toHaveBeenCalledWith('Test log message');
    spy.mockRestore();
  });

  it('should handle AppError in error handler', () => {
    const error = new AppError(404, 'Not Found');
    const req = { originalUrl: '/test', method: 'GET' } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not Found',
    });
  });

  it('should handle generic Error in error handler', () => {
    const error = new Error('Something went wrong');
    const req = { originalUrl: '/test', method: 'POST' } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'An unexpected error occurred',
    });
  });

  it('should handle not found requests', () => {
    const req = { originalUrl: '/unknown' } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    notFoundHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Route /unknown not found',
    });
  });
});
