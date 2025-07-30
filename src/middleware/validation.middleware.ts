import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

/**
 * Validace síly hesla
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Heslo musí mít alespoň 8 znaků');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Heslo musí obsahovat alespoň jedno velké písmeno');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Heslo musí obsahovat alespoň jedno malé písmeno');
  }

  if (!/\d/.test(password)) {
    errors.push('Heslo musí obsahovat alespoň jednu číslici');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Heslo musí obsahovat alespoň jeden speciální znak');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Middleware pro validaci registrace
 */
export const validateRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Uživatelské jméno musí mít 3-30 znaků')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Uživatelské jméno může obsahovat pouze písmena, čísla a podtržítko'),
  
  body('email')
    .isEmail()
    .withMessage('Neplatný formát emailu')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Heslo musí mít alespoň 8 znaků')
    .custom((value) => {
      const validation = validatePassword(value);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      return true;
    }),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Middleware pro validaci přihlášení
 */
export const validateLogin = [
  body('username')
    .notEmpty()
    .withMessage('Uživatelské jméno je povinné'),
  
  body('password')
    .notEmpty()
    .withMessage('Heslo je povinné'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Middleware pro sanitizaci vstupů
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitizace stringů
  const sanitizeString = (str: string): string => {
    return str
      .trim()
      .replace(/[<>]/g, '') // Odstranit potenciálně nebezpečné znaky
      .substring(0, 1000); // Omezení délky
  };

  // Sanitizace body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }

  // Sanitizace query parametrů
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key] as string);
      }
    });
  }

  next();
};

/**
 * Middleware pro validaci ObjectId
 */
export const validateObjectId = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        message: `Invalid ${paramName} format`
      });
    }
    
    next();
  };
};

/**
 * Middleware pro omezení velikosti požadavků
 */
export const limitRequestSize = (maxSize: number = 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        message: 'Request too large'
      });
    }
    
    next();
  };
}; 