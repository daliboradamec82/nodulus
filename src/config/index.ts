import dotenv from 'dotenv';
import path from 'path';

// Načtení .env souboru
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
  port: number;
  mongoUri: string;
  jwtSecret: string;
  email: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };
  frontendUrl: string;
}

export const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/security_app',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@example.com',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
}; 