import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';
import RedisStore from 'connect-redis';
import redisClient from './config/redis';
import authRoutes from './routes/auth';
import userRoutes from './routes/user.routes';
import positionRoutes from './routes/positions';
import extensionRoutes from './routes/extension';

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));

// Session middleware s Redis
app.use(session({
  store: new RedisStore({ 
    client: redisClient,
    prefix: 'sess:'
  }),
  secret: process.env.SESSION_SECRET || 'tajny_klic_pro_session',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hodin
  }
}));

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