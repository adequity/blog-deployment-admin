import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const addModeratorRole = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if 'moderator' value already exists
    const checkModeratorExists = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM pg_enum
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
        WHERE pg_type.typname = 'enum_users_role'
        AND pg_enum.enumlabel = 'moderator'
      ) AS exists
    `);

    if (checkModeratorExists.rows[0].exists) {
      console.log('✅ moderator role already exists');
    } else {
      // Add 'moderator' to enum_users_role
      await client.query(`
        ALTER TYPE "enum_users_role" ADD VALUE 'moderator'
      `);
      console.log('✅ moderator role added to enum_users_role');
    }

    console.log('\n🎉 Moderator role setup complete!');
    console.log('\nAvailable roles:');
    console.log('  - user (일반 사용자)');
    console.log('  - moderator (운영자/레퍼럴 관리자)');
    console.log('  - admin (관리자)');
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
};

addModeratorRole();
