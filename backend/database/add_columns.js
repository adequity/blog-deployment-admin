import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const addUserColumns = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // 1. Create ENUM types
    console.log('\n📝 Creating ENUM types...');

    // Check if enum_users_role exists
    const roleTypeCheck = await client.query(`
      SELECT 1 FROM pg_type WHERE typname = 'enum_users_role'
    `);

    if (roleTypeCheck.rows.length === 0) {
      await client.query(`CREATE TYPE "enum_users_role" AS ENUM ('user', 'admin')`);
      console.log('✅ enum_users_role created');
    } else {
      console.log('✅ enum_users_role already exists');
    }

    // Check if enum_users_id_type exists
    const idTypeCheck = await client.query(`
      SELECT 1 FROM pg_type WHERE typname = 'enum_users_id_type'
    `);

    if (idTypeCheck.rows.length === 0) {
      await client.query(`CREATE TYPE "enum_users_id_type" AS ENUM ('resident_card', 'driver_license', 'passport')`);
      console.log('✅ enum_users_id_type created');
    } else {
      console.log('✅ enum_users_id_type already exists');
    }

    // 2. Add role column
    console.log('\n📝 Adding role column...');
    const roleColCheck = await client.query(`
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'role'
    `);

    if (roleColCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE users
        ADD COLUMN role "enum_users_role" NOT NULL DEFAULT 'user'
      `);
      await client.query(`CREATE INDEX idx_users_role ON users(role)`);
      console.log('✅ role column added');
    } else {
      console.log('✅ role column already exists');
    }

    // 3. Add settlement columns
    console.log('\n📝 Adding settlement columns...');
    const bankColCheck = await client.query(`
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'bank_name'
    `);

    if (bankColCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE users
        ADD COLUMN bank_name VARCHAR(100),
        ADD COLUMN account_number VARCHAR(50),
        ADD COLUMN account_holder VARCHAR(100)
      `);
      console.log('✅ Settlement columns added');
    } else {
      console.log('✅ Settlement columns already exist');
    }

    // 4. Add identity columns
    console.log('\n📝 Adding identity columns...');
    const realNameColCheck = await client.query(`
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'real_name'
    `);

    if (realNameColCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE users
        ADD COLUMN real_name VARCHAR(100),
        ADD COLUMN id_type "enum_users_id_type",
        ADD COLUMN id_image_url VARCHAR(500),
        ADD COLUMN id_image_key VARCHAR(500),
        ADD COLUMN id_verified BOOLEAN DEFAULT false,
        ADD COLUMN id_verified_at TIMESTAMP
      `);
      console.log('✅ Identity columns added');
    } else {
      console.log('✅ Identity columns already exist');
    }

    console.log('\n🎉 All columns added successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
};

addUserColumns();
