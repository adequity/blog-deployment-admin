import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const addReferralSystem = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // 1. Add referred_by column to users table
    console.log('\n📝 Adding referred_by column...');
    const referredByCheck = await client.query(`
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'referred_by'
    `);

    if (referredByCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE users
        ADD COLUMN referred_by UUID REFERENCES users(id) ON DELETE SET NULL
      `);
      await client.query(`CREATE INDEX idx_users_referred_by ON users(referred_by)`);
      console.log('✅ referred_by column added');
    } else {
      console.log('✅ referred_by column already exists');
    }

    // 2. Add referral_code column (unique code for each moderator)
    console.log('\n📝 Adding referral_code column...');
    const referralCodeCheck = await client.query(`
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'referral_code'
    `);

    if (referralCodeCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE users
        ADD COLUMN referral_code VARCHAR(20) UNIQUE
      `);
      await client.query(`CREATE INDEX idx_users_referral_code ON users(referral_code)`);
      console.log('✅ referral_code column added');
    } else {
      console.log('✅ referral_code column already exists');
    }

    console.log('\n🎉 Referral system setup complete!');
    console.log('\n📋 Referral System Structure:');
    console.log('  - referred_by: User가 가입할 때 추천인(moderator) ID 저장');
    console.log('  - referral_code: Moderator가 사용할 고유 추천 코드');
    console.log('\n💡 Usage:');
    console.log('  1. Moderator는 고유한 referral_code 발급');
    console.log('  2. User 회원가입 시 referral_code 입력');
    console.log('  3. referred_by에 해당 moderator의 ID 자동 저장');
    console.log('  4. User가 수익 발생 시 referred_by의 moderator에게 수수료 지급');
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
};

addReferralSystem();
