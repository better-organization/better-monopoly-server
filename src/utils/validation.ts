import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// User validation schemas
export const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Game validation schemas
export const createGameSchema = Joi.object({
  maxPlayers: Joi.number().min(2).max(8).default(4),
  gameSettings: Joi.object({
    startingMoney: Joi.number().min(1000).max(10000).default(1500),
    passGoMoney: Joi.number().min(100).max(500).default(200),
    jailFine: Joi.number().min(50).max(200).default(50),
    houseCost: Joi.number().min(50).max(500).default(100),
    hotelCost: Joi.number().min(100).max(1000).default(200),
  }).default({}),
});

export const joinGameSchema = Joi.object({
  gameId: Joi.string().uuid().required(),
});

export const gameMoveSchema = Joi.object({
  type: Joi.string().valid('roll', 'buy', 'pay', 'trade').required(),
  data: Joi.object().required(),
});

// Validation middleware generator
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error, value } = (schema as any).validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          details: error.details.map((detail: any) => ({
            field: detail.path.join('.'),
            message: detail.message,
          })),
        },
      });
    }

    req.body = value;
    return next();
  };
};
