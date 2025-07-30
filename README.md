# 🚀 Nodulus - Enterprise-Grade Node.js Backend API

**Professional, scalable, and secure backend system built with TypeScript, Express.js, and MongoDB with advanced security features.**

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-4.x-red.svg)](https://redis.io/)
[![Security](https://img.shields.io/badge/Security-Enterprise-grade-brightgreen.svg)](https://owasp.org/)

## 🎯 Key Features

### 🔐 **Enterprise Security**
- **JWT Token Authentication** with refresh tokens
- **Redis Session Management** for scalability
- **Rate Limiting** against DDoS attacks
- **CORS Protection** with configurable origins
- **Input Validation** using express-validator
- **Password Hashing** with bcryptjs
- **Security Headers** (Helmet, CSP, HSTS)

### 🏗️ **Modern Architecture**
- **TypeScript** for type safety and better development
- **MVC Pattern** with clean logic separation
- **Middleware Architecture** for modular extensions
- **Error Handling** with centralized logging
- **Environment Configuration** for different environments

### 📊 **Database Layer**
- **MongoDB** with Mongoose ODM
- **Redis** for caching and sessions
- **Connection Pooling** for performance optimization
- **Data Validation** at schema level

### 🚀 **DevOps Ready**
- **Docker Support** with optimized image
- **Environment Variables** for configuration
- **Logging System** for monitoring
- **Health Checks** for load balancers
- **Graceful Shutdown** handling

## 📦 Installation

### Requirements
- Node.js 20.x or newer
- MongoDB 7.x
- Redis 4.x
- npm or yarn

### Quick Installation
```bash
# Clone repository
git clone https://github.com/your-username/nodulus.git
cd nodulus

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env file according to your needs

# Start in development mode
npm run dev
```

## ⚙️ Configuration

### Environment Variables (.env)
```bash
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/your-database
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Session Configuration
SESSION_SECRET=your-session-secret
SESSION_COOKIE_SECURE=false
SESSION_COOKIE_HTTPONLY=true

# Email Configuration (for SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:4200

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Running

### Development Mode
```bash
npm run dev
```
Server runs on: http://localhost:4000

### Production Mode
```bash
# Build application
npm run build

# Start
npm start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t nodulus-backend .

# Run container
docker run -p 4000:4000 --env-file .env nodulus-backend

# Or using docker-compose
docker-compose up -d
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register     # Register new user
POST   /api/auth/login        # Login
POST   /api/auth/logout       # Logout
POST   /api/auth/refresh      # Refresh JWT token
GET    /api/auth/me           # Get current user
```

### User Management
```
GET    /api/users             # List all users
GET    /api/users/:id         # Get user details
PUT    /api/users/:id         # Update user
DELETE /api/users/:id         # Delete user
POST   /api/users/:id/role    # Change user role
```

### Positions
```
GET    /api/positions         # List positions
POST   /api/positions         # Create new position
GET    /api/positions/:id     # Get position details
PUT    /api/positions/:id     # Update position
DELETE /api/positions/:id     # Delete position
```

### Extension API
```
GET    /api/extension/data    # Get extension data
POST   /api/extension/update  # Update data
```

## 🔐 Security Features

### 1. **Authentication & Authorization**
```typescript
// JWT Token validation
const token = jwt.verify(token, process.env.JWT_SECRET);

// Role-based access control
const hasPermission = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role === requiredRole) {
      next();
    } else {
      res.status(403).json({ message: 'Insufficient permissions' });
    }
  };
};
```

### 2. **Rate Limiting**
```typescript
// Rate limiting per IP address
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per window
  message: 'Too many requests from this IP address'
});
```

### 3. **Input Validation**
```typescript
// Input data validation
const { body, validationResult } = require('express-validator');

const validateUser = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').trim().isLength({ min: 2 })
];
```

### 4. **Security Headers**
```typescript
// Automatic security headers
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"]
  }
}));
```

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### API Tests
```bash
# Test API endpoints
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

## 📊 Monitoring & Logging

### Health Check
```bash
curl http://localhost:4000/health
```

### Logging
```typescript
// Centralized logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🚀 Production Deployment

### 1. **Environment Setup**
```bash
# Set production variables
export NODE_ENV=production
export PORT=4000
export MONGODB_URI=mongodb://your-production-db
export REDIS_URL=redis://your-production-redis
```

### 2. **Process Manager (PM2)**
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/index.js --name "nodulus-backend"

# Monitoring
pm2 monit
pm2 logs nodulus-backend
```

### 3. **Load Balancer Configuration**
```nginx
# Nginx configuration
upstream nodulus_backend {
    server 127.0.0.1:4000;
    server 127.0.0.1:4001;
    server 127.0.0.1:4002;
}

server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://nodulus_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. **SSL/HTTPS Setup**
```bash
# Certbot for Let's Encrypt
sudo certbot --nginx -d your-domain.com

# Or custom SSL certificates
sudo cp your-cert.pem /etc/ssl/certs/
sudo cp your-key.pem /etc/ssl/private/
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. **MongoDB Connection Error**
```bash
# Check MongoDB service
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

#### 2. **Redis Connection Error**
```bash
# Check Redis service
sudo systemctl status redis

# Restart Redis
sudo systemctl restart redis
```

#### 3. **Port Already in Use**
```bash
# Find process using port
lsof -i :4000

# Stop process
kill -9 <PID>
```

#### 4. **Memory Issues**
```bash
# Check memory usage
pm2 monit

# Restart application
pm2 restart nodulus-backend
```

## 📈 Performance Optimization

### 1. **Database Optimization**
```typescript
// Indexes for faster queries
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Connection pooling
mongoose.connect(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

### 2. **Caching Strategy**
```typescript
// Redis caching
const cacheUser = async (userId: string, userData: any) => {
  await redis.setex(`user:${userId}`, 3600, JSON.stringify(userData));
};

const getCachedUser = async (userId: string) => {
  const cached = await redis.get(`user:${userId}`);
  return cached ? JSON.parse(cached) : null;
};
```

### 3. **Compression**
```typescript
import compression from 'compression';

app.use(compression());
```

## 🔄 CI/CD Pipeline

### GitHub Actions (.github/workflows/deploy.yml)
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '20'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build application
      run: npm run build
      
    - name: Deploy to server
      run: |
        # Deployment commands
```

## 📚 Documentation

### API Documentation
- **Swagger/OpenAPI**: http://localhost:4000/api-docs
- **Postman Collection**: `/docs/postman-collection.json`

### Code Documentation
```bash
# Generate documentation
npm run docs

# Start documentation server
npm run docs:serve
```

## 🤝 Contributing

### Development Workflow
1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Standards
- **ESLint** for linting
- **Prettier** for formatting
- **TypeScript strict mode**
- **Conventional Commits**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/nodulus/issues)
- **Documentation**: [Wiki](https://github.com/your-username/nodulus/wiki)
- **Email**: support@yourcompany.com

---

**Nodulus** - Enterprise-grade backend solution for modern applications 🚀
