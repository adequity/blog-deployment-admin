import sequelize from '../config/database.js';

/**
 * Railway 데이터베이스에서 이전 ENUM 타입을 정리하는 스크립트
 *
 * 실행 방법:
 * 1. Railway 대시보드에서 백엔드 서비스 선택
 * 2. Settings -> Deploy Triggers -> Manual Deploy 클릭
 * 3. 또는 로컬에서: NODE_ENV=production node src/scripts/cleanupEnums.js
 */

async function cleanupEnums() {
  try {
    console.log('🧹 Starting ENUM cleanup...');
    console.log('Database:', process.env.PGDATABASE || 'Unknown');

    // 1. 데이터베이스 연결 확인
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // 2. role 컬럼이 ENUM 타입인지 확인
    const [columnInfo] = await sequelize.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'role';
    `);

    if (columnInfo.length > 0) {
      console.log('📊 Current role column info:', columnInfo[0]);

      // ENUM 타입이면 VARCHAR로 변경
      if (columnInfo[0].data_type === 'USER-DEFINED' || columnInfo[0].udt_name.includes('enum')) {
        console.log('⚠️ role column is using ENUM type. Converting to VARCHAR...');

        // 임시 컬럼으로 데이터 백업
        await sequelize.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS role_backup VARCHAR(20);
        `);

        await sequelize.query(`
          UPDATE users SET role_backup = role::text WHERE role IS NOT NULL;
        `);
        console.log('✅ Backed up role data');

        // 기존 컬럼 삭제
        await sequelize.query(`
          ALTER TABLE users DROP COLUMN role CASCADE;
        `);
        console.log('✅ Dropped old role column');

        // 새 VARCHAR 컬럼 생성
        await sequelize.query(`
          ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';
        `);

        // 데이터 복원
        await sequelize.query(`
          UPDATE users SET role = role_backup WHERE role_backup IS NOT NULL;
        `);

        // 백업 컬럼 삭제
        await sequelize.query(`
          ALTER TABLE users DROP COLUMN role_backup;
        `);
        console.log('✅ Converted role to VARCHAR and restored data');
      } else {
        console.log('✅ role column is already VARCHAR type');
      }
    } else {
      console.log('⚠️ role column does not exist. Creating it...');
      await sequelize.query(`
        ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';
      `);
      console.log('✅ Created role column');
    }

    // 3. id_type 컬럼도 확인 (있다면)
    const [idTypeInfo] = await sequelize.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'id_type';
    `);

    if (idTypeInfo.length > 0 &&
        (idTypeInfo[0].data_type === 'USER-DEFINED' || idTypeInfo[0].udt_name.includes('enum'))) {
      console.log('⚠️ id_type column is using ENUM type. Converting to VARCHAR...');

      await sequelize.query(`
        ALTER TABLE users ALTER COLUMN id_type TYPE VARCHAR(30) USING id_type::text;
      `);
      console.log('✅ Converted id_type to VARCHAR');
    }

    // 4. ENUM 타입 완전 삭제
    console.log('🗑️ Dropping ENUM types...');
    await sequelize.query('DROP TYPE IF EXISTS enum_users_role CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS enum_users_id_type CASCADE;');
    console.log('✅ ENUM types dropped');

    // 5. 인덱스 재생성
    console.log('📑 Creating indexes...');
    await sequelize.query('CREATE INDEX IF NOT EXISTS users_role ON users(role);');
    console.log('✅ Indexes created');

    // 6. 최종 확인
    const [finalCheck] = await sequelize.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name IN ('role', 'id_type')
      ORDER BY column_name;
    `);
    console.log('\n📊 Final column types:', finalCheck);

    console.log('\n✅ ENUM cleanup completed successfully!');
    console.log('💡 The database is now ready to use VARCHAR types for role and id_type columns.');

    process.exit(0);
  } catch (error) {
    console.error('❌ ENUM cleanup failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
cleanupEnums();
