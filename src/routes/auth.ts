import { Router } from 'express';
import { check, ValidationChain } from 'express-validator';
import * as authController from '../controllers/authController';
import auth from '../middleware/auth';

const router = Router();

// Validační middleware
const registerValidation: ValidationChain[] = [
  check('username', 'Uživatelské jméno je povinné').not().isEmpty(),
  check('email', 'Prosím zadejte platný email').isEmail(),
  check('password', 'Heslo musí mít alespoň 6 znaků').isLength({ min: 6 })
];

const loginValidation: ValidationChain[] = [
  check('username', 'Uživatelské jméno je povinné').not().isEmpty(),
  check('password', 'Heslo je povinné').exists()
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getMe);

export default router; 