import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
}

declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}

export default (req: Request, res: Response, next: NextFunction): void => {
  // Získání tokenu z hlavičky
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ message: 'Není poskytnut přístupový token' });
    return;
  }

  try {
    // Ověření tokenu
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Neplatný token' });
  }
}; 