import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const { Client } = pg;

const createAdmin = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Admin information
    const adminData = {
      id: uuidv4(),
      username: '성현시스템',
      email: 'admin@sh-system.co.kr',
      phone: '010-4952-6873',
      password: 'tjdgus66!',
      role: 'admin',
      referral_code: 'ADMIN001',
    };

    // Check if admin already exists
    const existingAdmin = await client.query(`
      SELECT * FROM users WHERE username = $1 OR email = $2
    `, [adminData.username, adminData.email]);

    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Admin user already exists');
      console.log('Existing user:', existingAdmin.rows[0]);
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(adminData.password, salt);

    // Create admin user
    const result = await client.query(`
      INSERT INTO users (
        id, username, email, phone, password_hash, role, referral_code, is_active, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
      )
      RETURNING id, username, email, phone, role, referral_code, is_active, created_at
    `, [
      adminData.id,
      adminData.username,
      adminData.email,
      adminData.phone,
      password_hash,
      adminData.role,
      adminData.referral_code,
      true
    ]);

    console.log('\n🎉 Admin user created successfully!');
    console.log('\n📋 Admin Details:');
    console.log('  Username:', result.rows[0].username);
    console.log('  Email:', result.rows[0].email);
    console.log('  Phone:', result.rows[0].phone);
    console.log('  Role:', result.rows[0].role);
    console.log('  Referral Code:', result.rows[0].referral_code);
    console.log('  Created At:', result.rows[0].created_at);
    console.log('\n🔐 Login Credentials:');
    console.log('  Username:', adminData.username);
    console.log('  Password:', adminData.password);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
};

createAdmin();
