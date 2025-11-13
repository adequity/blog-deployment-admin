import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

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
export const syncDatabase = async (options = {}) => {
  try {
    console.log('⚠️ Skipping Sequelize auto-sync to avoid ENUM issues');
    console.log('✅ Database connection ready - using existing schema');

    // Just verify tables exist, don't try to sync
    const [tables] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'users';
    `);

    if (tables.length === 0) {
      console.log('⚠️ Users table does not exist. Run migration script first.');
    } else {
      console.log('✅ Users table exists');

      // 🔧 Auto-fix: Check and add role column if missing
      try {
        console.log('🔍 Checking role column...');
        const [columns] = await sequelize.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'role';
        `);

        if (columns.length === 0) {
          console.log('⚠️ role column missing. Adding it now...');

          // Add role column
          await sequelize.query(`
            ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';
          `);
          console.log('✅ Added role column');

          // Drop ENUM types if they exist
          await sequelize.query('DROP TYPE IF EXISTS enum_users_role CASCADE;');
          await sequelize.query('DROP TYPE IF EXISTS enum_users_id_type CASCADE;');
          console.log('✅ Dropped ENUM types');

          // Create index
          await sequelize.query('CREATE INDEX IF NOT EXISTS users_role ON users(role);');
          console.log('✅ Created index on role column');
        } else {
          console.log('✅ role column exists');
        }
      } catch (roleError) {
        console.error('⚠️ Role column check/fix failed:', roleError.message);
        // Don't throw - continue with startup
      }
    }
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    throw error;
  }
};

export default sequelize;
