import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { testConnection, syncDatabase } from './config/database.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { seedPlatforms } from './seeders/platformSeeder.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(compression()); // Compress responses
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies (증가된 제한: Base64 이미지 지원)
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use(API_PREFIX, routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Sync database (in development only)
    if (process.env.NODE_ENV === 'development') {
      await syncDatabase({ alter: false });

      // Seed initial data
      await seedPlatforms();
    }

    // Start listening
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════╗
║   🚀 Blog Deployment System API Server      ║
╠═══════════════════════════════════════════════╣
║   Environment: ${process.env.NODE_ENV?.padEnd(28)} ║
║   Port: ${PORT.toString().padEnd(35)} ║
║   API Prefix: ${API_PREFIX.padEnd(30)} ║
║   CORS Origin: ${(process.env.CORS_ORIGIN || 'http://localhost:5173').padEnd(27)} ║
╚═══════════════════════════════════════════════╝
      `);
      console.log(`📡 API available at: http://localhost:${PORT}${API_PREFIX}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

// Start the server
startServer();

export default app;
