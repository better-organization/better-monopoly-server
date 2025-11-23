import app from './app';
import { config } from './config';
import { logger } from './utils/logger';

const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info(`🚀 ${config.appName} is running on port ${PORT}`);
  logger.info(`📝 Environment: ${config.nodeEnv}`);
  if (config.swaggerEnabled) {
    logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  }
});

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing server gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default server;
