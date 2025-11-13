import sequelize from '../config/database.js';

async function dropEnums() {
  try {
    console.log('Dropping ENUM types to fix migration issues...');

    // Drop the enum_users_role type if it exists
    await sequelize.query('DROP TYPE IF EXISTS enum_users_role CASCADE;');
    console.log('✓ Dropped enum_users_role');

    // Drop the enum_users_id_type type if it exists
    await sequelize.query('DROP TYPE IF EXISTS enum_users_id_type CASCADE;');
    console.log('✓ Dropped enum_users_id_type');

    console.log('Successfully dropped ENUM types');
    process.exit(0);
  } catch (error) {
    console.error('Error dropping ENUM types:', error);
    process.exit(1);
  }
}

dropEnums();
