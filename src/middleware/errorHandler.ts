import { Request, Response, NextFunction } from 'express';
import { RESPONSE_MESSAGES } from '../utils/responseMessages';

interface CustomError extends Error {
  statusCode?: number;
  status?: string;
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next?: NextFunction
): void => {
  const error = { ...err }; // Change let to const
  error.message = err.message;

  // Log error
  console.error(err);

  // Default error
  if (!error.statusCode) {
    error.statusCode = 500;
    error.message = RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    ...(process.env['NODE_ENV'] === 'development' && { stack: err.stack }),
  });
};
