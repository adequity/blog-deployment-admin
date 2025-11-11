import sequelize from '../config/database.js';

const resetPlatforms = async () => {
  try {
    console.log('Dropping platforms and platform_fields tables...');

    // Drop tables in correct order (children first)
    await sequelize.query('DROP TABLE IF EXISTS account_field_data CASCADE');
    await sequelize.query('DROP TABLE IF EXISTS blog_accounts CASCADE');
    await sequelize.query('DROP TABLE IF EXISTS platform_fields CASCADE');
    await sequelize.query('DROP TABLE IF EXISTS platforms CASCADE');

    console.log('✅ Tables dropped successfully');
    console.log('Server will recreate them automatically on next restart');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetPlatforms();
