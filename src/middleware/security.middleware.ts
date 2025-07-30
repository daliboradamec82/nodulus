import { Request, Response, NextFunction } from 'express';

export class SecurityMiddleware {
  /**
   * Middleware pro bezpečnostní hlavičky
   */
  static securityHeaders(req: Request, res: Response, next: NextFunction): void {
    // Ochrana proti XSS
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Ochrana proti clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Ochrana proti MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Strict Transport Security (HSTS)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    // Content Security Policy (CSP)
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'"
    ].join('; '));
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy
    res.setHeader('Permissions-Policy', [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()'
    ].join(', '));
    
    // Cache Control pro API
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    next();
  }

  /**
   * Middleware pro rate limiting hlavičky
   */
  static rateLimitHeaders(req: Request, res: Response, next: NextFunction): void {
    // Přidání rate limit hlaviček
    res.setHeader('X-RateLimit-Limit', '100');
    res.setHeader('X-RateLimit-Remaining', '99');
    res.setHeader('X-RateLimit-Reset', new Date(Date.now() + 900000).toISOString());
    
    next();
  }

  /**
   * Middleware pro CORS hlavičky
   */
  static corsHeaders(req: Request, res: Response, next: NextFunction): void {
    const origin = req.headers.origin;
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200'];
    
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    next();
  }

  /**
   * Middleware pro API versioning
   */
  static apiVersionHeaders(req: Request, res: Response, next: NextFunction): void {
    res.setHeader('X-API-Version', '1.0.0');
    res.setHeader('X-Server-Version', process.env.npm_package_version || '1.0.0');
    
    next();
  }

  /**
   * Middleware pro request ID
   */
  static requestIdHeaders(req: Request, res: Response, next: NextFunction): void {
    const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.setHeader('X-Request-ID', requestId);
    (req as any).requestId = requestId;
    
    next();
  }

  /**
   * Middleware pro security logging
   */
  static securityLogging(req: Request, res: Response, next: NextFunction): void {
    const requestId = (req as any).requestId;
    const userAgent = req.headers['user-agent'];
    const ip = req.ip || req.connection.remoteAddress;
    
    // Logování podezřelých požadavků
    if (this.isSuspiciousRequest(req)) {
      console.warn(`[SECURITY] Suspicious request detected:`, {
        requestId,
        ip,
        userAgent,
        method: req.method,
        url: req.url,
        headers: req.headers
      });
    }
    
    next();
  }

  /**
   * Detekce podezřelých požadavků
   */
  private static isSuspiciousRequest(req: Request): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /union\s+select/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /delete\s+from/i,
      /update\s+set/i
    ];
    
    const url = req.url.toLowerCase();
    const body = JSON.stringify(req.body).toLowerCase();
    
    return suspiciousPatterns.some(pattern => 
      pattern.test(url) || pattern.test(body)
    );
  }

  /**
   * Kompletní security middleware
   */
  static allSecurityMiddleware(req: Request, res: Response, next: NextFunction): void {
    this.requestIdHeaders(req, res, () => {
      this.securityHeaders(req, res, () => {
        this.corsHeaders(req, res, () => {
          this.apiVersionHeaders(req, res, () => {
            this.securityLogging(req, res, next);
          });
        });
      });
    });
  }
} 