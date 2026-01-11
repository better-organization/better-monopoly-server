import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import gameRoutes from './routes/game';
import connectDB from './config/db';

dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 8080;

app.use(helmet());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use(compression() as any);

// CORS configuration
app.use(
  cors({
    origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging middleware
app.use(morgan(process.env['NODE_ENV'] === 'production' ? 'combined' : 'dev'));

// Swagger API documentation (available in all environments)
app.use(
  '/swagger',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Better Monopoly API Docs',
  })
);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env['NODE_ENV'] || 'development'}`);
    console.log(
      `🌍 CORS enabled for: ${process.env['FRONTEND_URL'] || 'http://localhost:3000'}`
    );
    console.log(`📚 API Documentation: http://localhost:${PORT}/swagger`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
};

if (require.main === module) {
  startServer().catch(error => {
    console.error('Failed to start server', error);
    process.exit(1);
  });
}

export default app;
