import { Router } from 'express';
import { loginUser } from '../controllers/auth.controller';
import { loginValidation } from '../middlewares/validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication endpoints
 */

router.post('/login', loginValidation, loginUser);

export default router;
