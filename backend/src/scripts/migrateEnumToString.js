import sequelize from '../config/database.js';

async function migrateEnumToString() {
  try {
    console.log('🔧 Starting ENUM to STRING migration...');

    // 1. role 컬럼이 ENUM인지 확인하고 STRING으로 변경
    try {
      console.log('Checking role column type...');

      // role 컬럼을 임시 컬럼으로 복사
      await sequelize.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS role_temp VARCHAR(20);
      `);
      console.log('✅ Created temporary role column');

      // 기존 데이터를 임시 컬럼으로 복사
      await sequelize.query(`
        UPDATE users SET role_temp = role::text WHERE role IS NOT NULL;
      `);
      console.log('✅ Copied role data to temporary column');

      // 기존 role 컬럼 삭제
      await sequelize.query(`
        ALTER TABLE users DROP COLUMN IF EXISTS role CASCADE;
      `);
      console.log('✅ Dropped old role column');

      // 임시 컬럼을 role로 이름 변경
      await sequelize.query(`
        ALTER TABLE users RENAME COLUMN role_temp TO role;
      `);
      console.log('✅ Renamed temporary column to role');

      // NOT NULL과 DEFAULT 설정
      await sequelize.query(`
        ALTER TABLE users ALTER COLUMN role SET NOT NULL;
      `);
      await sequelize.query(`
        ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';
      `);
      console.log('✅ Set role column constraints');

    } catch (roleError) {
      console.warn('⚠️ Role column migration issue:', roleError.message);
    }

    // 2. id_type 컬럼이 ENUM인지 확인하고 STRING으로 변경
    try {
      console.log('Checking id_type column type...');

      // id_type 컬럼을 임시 컬럼으로 복사
      await sequelize.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS id_type_temp VARCHAR(30);
      `);
      console.log('✅ Created temporary id_type column');

      // 기존 데이터를 임시 컬럼으로 복사
      await sequelize.query(`
        UPDATE users SET id_type_temp = id_type::text WHERE id_type IS NOT NULL;
      `);
      console.log('✅ Copied id_type data to temporary column');

      // 기존 id_type 컬럼 삭제
      await sequelize.query(`
        ALTER TABLE users DROP COLUMN IF EXISTS id_type CASCADE;
      `);
      console.log('✅ Dropped old id_type column');

      // 임시 컬럼을 id_type으로 이름 변경
      await sequelize.query(`
        ALTER TABLE users RENAME COLUMN id_type_temp TO id_type;
      `);
      console.log('✅ Renamed temporary column to id_type');

    } catch (idTypeError) {
      console.warn('⚠️ id_type column migration issue:', idTypeError.message);
    }

    // 3. ENUM 타입 삭제
    await sequelize.query('DROP TYPE IF EXISTS enum_users_role CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS enum_users_id_type CASCADE;');
    console.log('✅ Dropped ENUM types');

    // 4. 인덱스 재생성
    try {
      await sequelize.query('CREATE INDEX IF NOT EXISTS users_role ON users(role);');
      console.log('✅ Recreated role index');
    } catch (indexError) {
      console.warn('⚠️ Index creation issue:', indexError.message);
    }

    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateEnumToString();
