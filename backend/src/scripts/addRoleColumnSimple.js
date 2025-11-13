import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function addRoleColumn() {
  const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    }
  });

  try {
    console.log('🔗 Connecting to Railway PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully');

    // 1. Check if role column exists
    console.log('\n📊 Checking if role column exists...');
    const [tableInfo] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    console.log('Current columns:', tableInfo);

    const hasRoleColumn = tableInfo.some(row => row.column_name === 'role');

    if (!hasRoleColumn) {
      console.log('\n⚠️ role column does not exist. Adding it...');

      // Add role column
      await sequelize.query(`
        ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';
      `);
      console.log('✅ Added role column');
    } else {
      console.log('\n✅ role column already exists');
    }

    // 2. Drop ENUM types
    console.log('\n🗑️ Dropping ENUM types...');
    await sequelize.query('DROP TYPE IF EXISTS enum_users_role CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS enum_users_id_type CASCADE;');
    console.log('✅ ENUM types dropped');

    // 3. Create index
    console.log('\n📑 Creating index on role column...');
    await sequelize.query('CREATE INDEX IF NOT EXISTS users_role ON users(role);');
    console.log('✅ Index created');

    // 4. Verify final structure
    console.log('\n📊 Final table structure:');
    const [finalTableInfo] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    console.log(finalTableInfo);

    // 5. Check existing users
    console.log('\n👥 Current users:');
    const [users] = await sequelize.query('SELECT id, username, email, role FROM users;');
    console.log(users);

    console.log('\n✅ Database fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

addRoleColumn();
