import sequelize from '../config/database.js';

async function cleanDatabase() {
  try {
    console.log('🔧 Starting database cleanup...');

    // Drop users table completely
    await sequelize.query('DROP TABLE IF EXISTS users CASCADE;');
    console.log('✅ Dropped users table');

    // Drop ENUM types
    await sequelize.query('DROP TYPE IF EXISTS enum_users_role CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS enum_users_id_type CASCADE;');
    console.log('✅ Dropped ENUM types');

    // Force sync to recreate tables
    await sequelize.sync({ force: true });
    console.log('✅ Database tables recreated successfully');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    process.exit(1);
  }
}

cleanDatabase();
