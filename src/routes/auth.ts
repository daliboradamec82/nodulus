import { Router } from 'express';
import { check, ValidationChain } from 'express-validator';
import { AuthController } from '../controllers/authController';
import auth from '../middleware/auth';
import { validateRegistration, validateLogin, sanitizeInput } from '../middleware/validation.middleware';

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

// Vytvoření instance AuthController
const authController = new AuthController();

// Routes
router.post('/register', sanitizeInput, validateRegistration, authController.register.bind(authController));
router.post('/login', sanitizeInput, validateLogin, authController.login.bind(authController));
router.post('/logout', auth, authController.logout.bind(authController));
router.get('/me', auth, authController.getMe.bind(authController));

export default router; 