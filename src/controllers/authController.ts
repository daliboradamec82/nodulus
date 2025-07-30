import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { IUser, IUserResponse, ILoginRequest, IRegisterRequest } from '../types/user';
import { emailService } from '../services/emailService';
import { BaseController } from './base.controller';

declare module 'express-session' {
  interface SessionData {
    user?: IUserResponse;
  }
}

export class AuthController extends BaseController {
  private createUserResponse(user: IUser): IUserResponse {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
  }

  private generateToken(userId: string): string {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  public async register(
    req: Request<{}, {}, IRegisterRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { username, email, password } = req.body;

      // Kontrola existence uživatele bez enumerace
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        // Generické chybové hlášení bez prozrazení, který údaj již existuje
        res.status(400).json({ message: 'Registrace se nezdařila. Zkontrolujte své údaje a zkuste to znovu.' });
        return;
      }

      const newUser = new User({
        username,
        email,
        password: await this.hashPassword(password)
      });

      await newUser.save();

      const token = this.generateToken(newUser.id);
      const userResponse = this.createUserResponse(newUser);
      req.session.user = userResponse;

      // Asynchronní odeslání emailu (neblokuje odpověď)
      emailService.sendRegistrationConfirmation(email, username)
        .catch(error => {
          console.error('Chyba při odesílání potvrzovacího emailu:', error);
          // Nevyhazujeme chybu - uživatel je registrovaný i bez emailu
        });

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
  }

  public async login(
    req: Request<{}, {}, ILoginRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
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

      const isMatch = await this.comparePassword(password, user.password);
      if (!isMatch) {
        res.status(401).json({ message: 'Nesprávné přihlašovací údaje' });
        return;
      }

      const token = this.generateToken(user.id);
      const userResponse = this.createUserResponse(user);
      req.session.user = userResponse;

      res.json({
        token,
        user: userResponse
      });
    } catch (error) {
      next(error);
    }
  }

  public logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
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
  }

  public async getMe(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
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

      const userResponse = this.createUserResponse(user);
      req.session.user = userResponse;

      res.json(userResponse);
    } catch (error) {
      next(error);
    }
  }

  public async forgotPassword(req: Request, res: Response): Promise<void> {
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