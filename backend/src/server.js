import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import pkg from 'pg';
const { Client } = pkg;
import { testConnection, syncDatabase } from './config/database.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { seedPlatforms } from './seeders/platformSeeder.js';

// Railway는 환경변수를 자동으로 주입하므로 dotenv 불필요

/**
 * PostgreSQL ENUM 타입 정리 함수
 * 서버 시작 시 한 번만 실행되어 이전 ENUM 타입을 제거
 */
async function cleanupEnumTypes() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  });

  try {
    await client.connect();

    // ENUM 타입 체크
    const { rows } = await client.query(`
      SELECT typname
      FROM pg_type
      WHERE typname IN ('enum_users_role', 'enum_users_id_type')
      ORDER BY typname;
    `);

    if (rows.length > 0) {
      console.log('🧹 Cleaning up obsolete ENUM types...');

      // ENUM 타입 삭제
      await client.query('DROP TYPE IF EXISTS enum_users_role CASCADE;');
      await client.query('DROP TYPE IF EXISTS enum_users_id_type CASCADE;');

      console.log('✅ ENUM types cleanup completed');
    }

    await client.end();
  } catch (error) {
    console.warn('⚠️ ENUM cleanup warning:', error.message);
    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup error
    }
  }
}

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Middleware
app.use(helmet()); // Security headers

// CORS configuration - supports multiple origins
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

    // Clean up obsolete ENUM types (runs only once on startup)
    await cleanupEnumTypes();

    // Verify database without auto-sync
    await syncDatabase();

    // Seed initial data
    await seedPlatforms();

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
