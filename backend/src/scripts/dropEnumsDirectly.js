import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

/**
 * Directly drop ENUM types from PostgreSQL database
 * This script connects to Railway PostgreSQL and removes enum_users_role and enum_users_id_type
 */

async function dropEnumsDirectly() {
  // Create PostgreSQL client using DATABASE_URL from environment
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔗 Connecting to PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected successfully');

    // Check if ENUM types exist
    console.log('\n📊 Checking existing ENUM types...');
    const result = await client.query(`
      SELECT typname
      FROM pg_type
      WHERE typname LIKE 'enum%'
      ORDER BY typname;
    `);

    if (result.rows.length > 0) {
      console.log('Found ENUM types:');
      result.rows.forEach(row => {
        console.log(`  - ${row.typname}`);
      });

      // Drop ENUM types
      console.log('\n🗑️ Dropping ENUM types...');

      try {
        await client.query('DROP TYPE IF EXISTS enum_users_role CASCADE;');
        console.log('✅ Dropped enum_users_role');
      } catch (err) {
        console.log(`⚠️ Could not drop enum_users_role: ${err.message}`);
      }

      try {
        await client.query('DROP TYPE IF EXISTS enum_users_id_type CASCADE;');
        console.log('✅ Dropped enum_users_id_type');
      } catch (err) {
        console.log(`⚠️ Could not drop enum_users_id_type: ${err.message}`);
      }

      // Verify cleanup
      console.log('\n📊 Verifying cleanup...');
      const verifyResult = await client.query(`
        SELECT typname
        FROM pg_type
        WHERE typname LIKE 'enum%'
        ORDER BY typname;
      `);

      if (verifyResult.rows.length === 0) {
        console.log('✅ All ENUM types successfully removed!');
      } else {
        console.log('⚠️ Some ENUM types still exist:');
        verifyResult.rows.forEach(row => {
          console.log(`  - ${row.typname}`);
        });
      }
    } else {
      console.log('✅ No ENUM types found - database is clean!');
    }

    console.log('\n✅ Script completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the script
dropEnumsDirectly();
