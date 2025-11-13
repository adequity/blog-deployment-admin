import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const updateExistingUsersReferral = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Get the first admin (default referrer)
    const adminResult = await client.query(`
      SELECT id, username, email FROM users
      WHERE role = 'admin'
      ORDER BY created_at ASC
      LIMIT 1
    `);

    if (adminResult.rows.length === 0) {
      console.log('❌ No admin found. Please create an admin first.');
      return;
    }

    const admin = adminResult.rows[0];
    console.log('\n📋 Default Admin:');
    console.log('  ID:', admin.id);
    console.log('  Username:', admin.username);
    console.log('  Email:', admin.email);

    // Get all users with NULL referred_by
    const usersToUpdate = await client.query(`
      SELECT id, username, email, role FROM users
      WHERE referred_by IS NULL AND role = 'user'
    `);

    console.log('\n📊 Users to update:', usersToUpdate.rows.length);

    if (usersToUpdate.rows.length === 0) {
      console.log('✅ All users already have a referrer!');
      return;
    }

    // Update all users to have admin as referrer
    const updateResult = await client.query(`
      UPDATE users
      SET referred_by = $1, updated_at = NOW()
      WHERE referred_by IS NULL AND role = 'user'
      RETURNING id, username, email
    `, [admin.id]);

    console.log('\n🎉 Successfully updated', updateResult.rows.length, 'users!');
    console.log('\n📋 Updated Users:');
    updateResult.rows.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.username} (${user.email})`);
    });

    // Verify the update
    const verifyResult = await client.query(`
      SELECT
        COUNT(*) as total_users,
        COUNT(referred_by) as users_with_referrer
      FROM users
      WHERE role = 'user'
    `);

    console.log('\n✅ Verification:');
    console.log('  Total users:', verifyResult.rows[0].total_users);
    console.log('  Users with referrer:', verifyResult.rows[0].users_with_referrer);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
};

updateExistingUsersReferral();
