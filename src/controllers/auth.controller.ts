import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { LoginRequest, UserResponse } from '../types/auth.types';
import { logger } from '../utils/logger';
import { AppError } from '../middlewares/errorHandler';

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User Login
 *     description: Logs in a user with the provided username and assigns them to a room
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             loginExample:
 *               summary: Example login request
 *               value:
 *                 username: john_doe
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *             examples:
 *               success:
 *                 summary: Successful login response
 *                 value:
 *                   success: true
 *                   message: Login successful
 *       400:
 *         description: Bad Request - Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               badRequest:
 *                 summary: Bad request error
 *                 value:
 *                   success: false
 *                   message: Username cannot be empty
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 summary: Internal server error
 *                 value:
 *                   success: false
 *                   message: An unexpected error occurred
 */
export const loginUser = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Username cannot be empty');
    }

    const loginRequest = req.body as LoginRequest;
    logger.info(`Login request received for username: ${loginRequest.username}`);

    const userResponse: UserResponse = {
      success: true,
      message: 'Login successful',
    };

    logger.info(`Successful login: ${JSON.stringify(userResponse)}`);
    res.status(200).json(userResponse);
  } catch (error) {
    next(error);
  }
};
