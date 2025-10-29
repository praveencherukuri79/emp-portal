import express, { Application } from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import { errorHandler } from './middlewares/error.middleware';
import { rateLimiter } from './middlewares/rate-limiter.middleware';

// Import Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import timesheetRoutes from './routes/timesheet.routes';
import documentRoutes from './routes/document.routes';
import tenantRoutes from './routes/tenant.routes';
import leaveRoutes from './routes/leave.routes';
import notificationRoutes from './routes/notification.routes';
import analyticsRoutes from './routes/analytics.routes';
import dashboardRoutes from './routes/dashboard.routes';
import teamRoutes from './routes/team.routes';
import reportsRoutes from './routes/reports.routes';
import projectRoutes from './routes/project.routes';

// Environment variables are loaded via -r dotenv/config flag
console.log('🔐 JWT_SECRET loaded:', process.env.JWT_SECRET ? 'Yes' : 'No');

// Construct MongoDB URI from environment variables
const getMongoDBUri = (): string => {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }
  
  const dbUser = process.env.DB_USER_NAME;
  const dbPassword = process.env.DB_PASSWORD;
  const dbCluster = process.env.DB_CLUSTER;
  const dbName = process.env.DB_NAME || 'emp-portal';
  const dbAppName = process.env.DB_APP_NAME || 'Cluster0';
  
  if (dbUser && dbPassword && dbCluster) {
    return `mongodb+srv://${dbUser}:${dbPassword}@${dbCluster}/${dbName}?retryWrites=true&w=majority&appName=${dbAppName}`;
  }
  
  // Fallback to local MongoDB
  return 'mongodb://localhost:27017/emp-portal';
};

const MONGODB_URI = getMongoDBUri();

class Server {
  public app: Application;

  constructor() {
    this.app = express();
    this.config();
    this.connectDatabase();
    this.routes();
    this.errorHandling();
  }

  private config(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
      })
    );

    // Compression
    this.app.use(compression());

    // Body parser
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Cookie parser
    this.app.use(cookieParser());

    // Session configuration
    this.app.use(
      session({
        secret: process.env.SESSION_SECRET || 'default-secret',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          mongoUrl: MONGODB_URI,
          ttl: 24 * 60 * 60, // 1 day
        }),
        cookie: {
          maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000'),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        },
      })
    );

    // Static files
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    // Rate limiting
    this.app.use('/api', rateLimiter);
  }

  private async connectDatabase(): Promise<void> {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('✅ MongoDB connected successfully');
      console.log(`📦 Database: ${process.env.DB_NAME || 'emp-portal'}`);
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    }
  }

  private routes(): void {
    // Health check
    this.app.get('/health', (_req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // API Routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/timesheets', timesheetRoutes);
    this.app.use('/api/documents', documentRoutes);
    this.app.use('/api/tenants', tenantRoutes);
    this.app.use('/api/leaves', leaveRoutes);
    this.app.use('/api/notifications', notificationRoutes);
    this.app.use('/api/analytics', analyticsRoutes);
    this.app.use('/api/dashboard', dashboardRoutes);
    this.app.use('/api/team', teamRoutes);
    this.app.use('/api/reports', reportsRoutes);
    this.app.use('/api/projects', projectRoutes);

    // 404 handler
    this.app.use('*', (_req, res) => {
      res.status(404).json({ message: 'Route not found' });
    });
  }

  private errorHandling(): void {
    this.app.use(errorHandler);
  }

  public start(): void {
    const PORT = process.env.PORT || 3000;
    this.app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  }
}

const server = new Server();
server.start();

export default server.app;