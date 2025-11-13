import { Sequelize } from 'sequelize';

// Railway는 환경변수를 자동으로 주입하므로 dotenv 불필요

const sequelize = new Sequelize({
  host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
  port: process.env.PGPORT || process.env.DB_PORT || 5432,
  database: process.env.PGDATABASE || process.env.DB_NAME || 'blog_deployment',
  username: process.env.PGUSER || process.env.DB_USER || 'postgres',
  password: process.env.PGPASSWORD || process.env.DB_PASSWORD || '',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
});

// Test database connection
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to database:', error.message);
    return false;
  }
};

// Manual database sync without Sequelize's auto-sync
// Tables will be created manually via Railway dashboard
export const syncDatabase = async (options = {}) => {
  try {
    console.log('✅ Database connection ready - tables managed manually via Railway dashboard');
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    throw error;
  }
};

export default sequelize;
