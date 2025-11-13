import sequelize from '../config/database.js';
import User from '../models/User.js';

const createAdminUser = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // 어드민 계정 정보
    const adminData = {
      username: 'admin',
      email: 'admin@example.com',
      phone: '010-0000-0000',
      password_hash: await User.hashPassword('admin123!@#'), // 비밀번호: admin123!@#
      role: 'admin',
      is_active: true,
    };

    // 기존 어드민 계정이 있는지 확인
    const existingAdmin = await User.findOne({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log(`Username: ${existingAdmin.username}`);
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);

      // 비밀번호만 업데이트
      existingAdmin.password_hash = adminData.password_hash;
      await existingAdmin.save();
      console.log('✅ Admin password updated to: admin123!@#');
    } else {
      // 새 어드민 계정 생성
      const admin = await User.create(adminData);
      console.log('✅ Admin user created successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 Admin Account Details:');
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: admin123!@#`);
      console.log(`   Role: ${admin.role}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
