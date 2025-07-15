import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { IUser, IUserResponse, ILoginRequest, IRegisterRequest } from '../types/user';
import { emailService } from '../services/emailService';

declare module 'express-session' {
  interface SessionData {
    user?: IUserResponse;
  }
}

const createUserResponse = (user: IUser): IUserResponse => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role
});

export const register = async (
  req: Request<{}, {}, IRegisterRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { username, email, password } = req.body;

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      res.status(400).json({ message: 'Uživatel již existuje' });
      return;
    }

    user = new User({
      username,
      email,
      password: await bcrypt.hash(password, 10)
    });

    await user.save();

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || '',
      { expiresIn: '24h' }
    );

    const userResponse = createUserResponse(user);
    req.session.user = userResponse;

    await emailService.sendRegistrationConfirmation(email, username);

    res.status(201).json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'An error occurred during registration.',
    });
  }
};

export const login = async (
  req: Request<{}, {}, ILoginRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ message: 'Nesprávné přihlašovací údaje' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Nesprávné přihlašovací údaje' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || '',
      { expiresIn: '24h' }
    );

    const userResponse = createUserResponse(user);
    req.session.user = userResponse;

    res.json({
      token,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.session.destroy((err) => {
      if (err) {
        next(err);
        return;
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Úspěšně odhlášeno' });
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.session.user) {
      res.json(req.session.user);
      return;
    }

    if (!req.user?.userId) {
      res.status(401).json({ message: 'Neautorizovaný přístup' });
      return;
    }

    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'Uživatel nenalezen' });
      return;
    }

    const userResponse = createUserResponse(user);
    req.session.user = userResponse;

    res.json(userResponse);
  } catch (error) {
    next(error);
  }
};

export class AuthController {
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      // Zde by byla logika pro generování reset tokenu
      const resetToken = 'dummy-reset-token';

      await emailService.sendPasswordReset(email, resetToken);

      res.json({
        message: 'If an account exists with that email, a password reset link has been sent.',
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        message: 'An error occurred while processing your request.',
      });
    }
  }
} 