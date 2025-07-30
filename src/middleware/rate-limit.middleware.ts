import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Rate limiting middleware
 * @param windowMs Časové okno v milisekundách
 * @param maxRequests Maximální počet požadavků v okně
 * @param keyGenerator Funkce pro generování klíče (výchozí: IP adresa)
 */
export const rateLimit = (
  windowMs: number = 15 * 60 * 1000, // 15 minut
  maxRequests: number = 100,
  keyGenerator: (req: Request) => string = (req) => req.ip || 'unknown'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Vyčistit staré záznamy
    if (store[key] && store[key].resetTime < now) {
      delete store[key];
    }

    // Vytvořit nový záznam nebo aktualizovat existující
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs
      };
    } else {
      store[key].count++;
    }

    // Kontrola limitu
    if (store[key].count > maxRequests) {
      res.status(429).json({
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
      });
      return;
    }

    // Přidat hlavičky
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - store[key].count));
    res.setHeader('X-RateLimit-Reset', new Date(store[key].resetTime).toISOString());

    next();
  };
};

/**
 * Strict rate limiting pro autentifikaci
 */
export const authRateLimit = rateLimit(
  15 * 60 * 1000, // 15 minut
  5, // Maximálně 5 pokusů
  (req) => `auth:${req.ip || 'unknown'}`
);

/**
 * API rate limiting
 */
export const apiRateLimit = rateLimit(
  15 * 60 * 1000, // 15 minut
  1000, // 1000 požadavků za 15 minut
  (req) => `api:${req.ip || 'unknown'}`
);

/**
 * Registration rate limiting
 */
export const registrationRateLimit = rateLimit(
  60 * 60 * 1000, // 1 hodina
  3, // Maximálně 3 registrace za hodinu
  (req) => `registration:${req.ip || 'unknown'}`
); 