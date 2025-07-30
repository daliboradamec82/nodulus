import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/user.routes';
import positionRoutes from './routes/positions';
import extensionRoutes from './routes/extension';
import { SessionConfigManager } from './config/session.config';
import { SecurityMiddleware } from './middleware/security.middleware';

const app = express();

// Security middleware (musí být první)
app.use(SecurityMiddleware.allSecurityMiddleware);

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));

// Session middleware s Redis
app.use(SessionConfigManager.getSessionMiddleware());

// Připojení k MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-app')
  .then(() => console.log('Připojeno k MongoDB'))
  .catch(err => console.error('Chyba připojení k MongoDB:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/extension', extensionRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Něco se pokazilo!' });
});

export default app; 