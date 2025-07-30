import session from 'express-session';
import RedisStore from 'connect-redis';
import redisClient from './redis';

export interface SessionConfig {
  secret: string;
  store: RedisStore;
  resave: boolean;
  saveUninitialized: boolean;
  cookie: {
    secure: boolean;
    httpOnly: boolean;
    maxAge: number;
    sameSite: 'strict' | 'lax' | 'none';
  };
}

export class SessionConfigManager {
  private static validateEnvironment(): void {
    if (!process.env.SESSION_SECRET) {
      throw new Error('SESSION_SECRET environment variable is required');
    }
    
    if (!process.env.NODE_ENV) {
      throw new Error('NODE_ENV environment variable is required');
    }
  }

  public static getSessionConfig(): session.SessionOptions {
    this.validateEnvironment();

    const isProduction = process.env.NODE_ENV === 'production';
    
    return {
      store: new RedisStore({ 
        client: redisClient,
        prefix: 'sess:'
      }),
      secret: process.env.SESSION_SECRET || 'fallback-secret-key',
      resave: false,
      saveUninitialized: false,
      name: 'sessionId', // Změna z výchozího 'connect.sid'
      cookie: {
        secure: isProduction, // HTTPS pouze v produkci
        httpOnly: true, // Ochrana proti XSS
        maxAge: 1000 * 60 * 60 * 24, // 24 hodin
        sameSite: isProduction ? 'strict' : 'lax', // CSRF ochrana
        path: '/',
        domain: isProduction ? process.env.DOMAIN : undefined
      },
      rolling: true, // Prodloužení session při aktivitě
      unset: 'destroy' // Smazání session při logout
    };
  }

  public static getSessionMiddleware() {
    return session(this.getSessionConfig());
  }
} 