import { body } from 'express-validator';

export const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username cannot be empty')
    .isString()
    .withMessage('Username must be a string')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
];
