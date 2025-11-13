import pg from 'pg';
const { Client } = pg;

async function fixRoleColumn() {
  // Railway PostgreSQL 연결 정보
  const client = new Client({
    host: 'tramway.proxy.rlwy.net',
    port: 33230,
    database: 'railway',
    user: 'postgres',
    password: 'GtGzUJBisIKSPtUxQKdSzVgiGsVNRtth',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔗 Connecting to Railway PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully');

    // 1. 현재 users 테이블 구조 확인
    console.log('\n📊 Checking users table structure...');
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    console.log('Current columns:', tableInfo.rows);

    // 2. role 컬럼이 있는지 확인
    const hasRoleColumn = tableInfo.rows.some(row => row.column_name === 'role');

    if (!hasRoleColumn) {
      console.log('\n⚠️ role column does not exist. Adding it...');

      // role 컬럼 추가
      await client.query(`
        ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';
      `);
      console.log('✅ Added role column');
    } else {
      console.log('\n✅ role column already exists');
    }

    // 3. ENUM 타입 삭제
    console.log('\n🗑️ Dropping ENUM types...');
    await client.query('DROP TYPE IF EXISTS enum_users_role CASCADE;');
    await client.query('DROP TYPE IF EXISTS enum_users_id_type CASCADE;');
    console.log('✅ ENUM types dropped');

    // 4. 인덱스 생성
    console.log('\n📑 Creating index on role column...');
    await client.query('CREATE INDEX IF NOT EXISTS users_role ON users(role);');
    console.log('✅ Index created');

    // 5. 최종 테이블 구조 확인
    console.log('\n📊 Final table structure:');
    const finalTableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    console.log(finalTableInfo.rows);

    // 6. 기존 데이터 확인
    console.log('\n👥 Current users:');
    const users = await client.query('SELECT id, username, email, role FROM users;');
    console.log(users.rows);

    console.log('\n✅ Database fix completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
    console.log('\n🔌 Connection closed');
  }
}

fixRoleColumn();
