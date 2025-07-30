export class EnvironmentConfig {
  private static requiredEnvVars = [
    'SESSION_SECRET',
    'JWT_SECRET',
    'NODE_ENV',
    'MONGODB_URI'
  ];

  private static optionalEnvVars = [
    'FRONTEND_URL',
    'DOMAIN',
    'REDIS_URL',
    'PORT'
  ];

  public static validateEnvironment(): void {
    const missingVars: string[] = [];

    this.requiredEnvVars.forEach(varName => {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    });

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }

  public static getEnvironmentConfig() {
    this.validateEnvironment();

    return {
      nodeEnv: process.env.NODE_ENV!,
      isProduction: process.env.NODE_ENV === 'production',
      isDevelopment: process.env.NODE_ENV === 'development',
      sessionSecret: process.env.SESSION_SECRET!,
      jwtSecret: process.env.JWT_SECRET!,
      mongodbUri: process.env.MONGODB_URI!,
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
      domain: process.env.DOMAIN,
      redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
      port: parseInt(process.env.PORT || '5000', 10)
    };
  }

  public static getCorsConfig() {
    const config = this.getEnvironmentConfig();
    
    return {
      origin: config.isProduction 
        ? [config.frontendUrl] 
        : [config.frontendUrl, 'http://localhost:4200'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
    };
  }

  public static getSecurityConfig() {
    const config = this.getEnvironmentConfig();
    
    return {
      cookieSecure: config.isProduction,
      cookieSameSite: config.isProduction ? 'strict' : 'lax',
      sessionName: 'sessionId',
      sessionMaxAge: 1000 * 60 * 60 * 24, // 24 hodin
      jwtExpiresIn: '24h'
    };
  }
} 