import sequelize from '../config/database.js';
import User from '../models/User.js';
import Platform from '../models/Platform.js';
import PlatformField from '../models/PlatformField.js';
import BlogAccount from '../models/BlogAccount.js';
import AccountFieldData from '../models/AccountFieldData.js';
import bcrypt from 'bcrypt';

async function resetDatabase() {
  try {
    console.log('🔄 Starting database reset...');

    // Drop all tables
    console.log('⚠️  Dropping all tables...');
    await sequelize.drop({ cascade: true });
    console.log('✅ All tables dropped');

    // Recreate all tables
    console.log('🔄 Creating tables...');
    await sequelize.sync({ force: false });
    console.log('✅ All tables created');

    // Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('tjdgus66!', 10);
    const adminUser = await User.create({
      username: '성현시스템',
      email: 'admin@sh-system.co.kr',
      phone: '010-4952-6873',
      password_hash: hashedPassword,
      role: 'admin',
      is_active: true,
      referral_code: 'ADMIN001',
    });
    console.log('✅ Admin user created:', adminUser.username);

    // Create platforms
    console.log('📦 Creating platforms...');
    const naverPlatform = await Platform.create({
      name: 'naver',
      displayName: '네이버 블로그',
      description: '네이버 블로그 플랫폼',
      icon: '📘',
      isActive: true,
      apiEndpoint: 'https://openapi.naver.com',
      loginUrl: 'https://blog.naver.com',
    });

    const tistoryPlatform = await Platform.create({
      name: 'tistory',
      displayName: '티스토리',
      description: '티스토리 블로그 플랫폼',
      icon: '📙',
      isActive: true,
      apiEndpoint: 'https://www.tistory.com/apis',
      loginUrl: 'https://www.tistory.com',
    });
    console.log('✅ Platforms created');

    // Create platform fields for Naver
    console.log('📝 Creating platform fields...');
    await PlatformField.create({
      platformId: naverPlatform.id,
      fieldName: 'blog_id',
      fieldLabel: '블로그 ID',
      fieldType: 'text',
      isRequired: true,
      isEncrypted: false,
      placeholder: '블로그 ID를 입력하세요',
      helpText: '네이버 블로그 ID (예: myblog)',
      validation: { regex: '^[a-zA-Z0-9_-]+$' },
      displayOrder: 1,
    });

    await PlatformField.create({
      platformId: naverPlatform.id,
      fieldName: 'client_id',
      fieldLabel: 'Client ID',
      fieldType: 'text',
      isRequired: true,
      isEncrypted: true,
      placeholder: 'Client ID를 입력하세요',
      helpText: '네이버 애플리케이션 Client ID',
      displayOrder: 2,
    });

    await PlatformField.create({
      platformId: naverPlatform.id,
      fieldName: 'client_secret',
      fieldLabel: 'Client Secret',
      fieldType: 'password',
      isRequired: true,
      isEncrypted: true,
      placeholder: 'Client Secret을 입력하세요',
      helpText: '네이버 애플리케이션 Client Secret',
      displayOrder: 3,
    });

    // Create platform fields for Tistory
    await PlatformField.create({
      platformId: tistoryPlatform.id,
      fieldName: 'blog_name',
      fieldLabel: '블로그 이름',
      fieldType: 'text',
      isRequired: true,
      isEncrypted: false,
      placeholder: '블로그 이름을 입력하세요',
      helpText: '티스토리 블로그 이름',
      displayOrder: 1,
    });

    await PlatformField.create({
      platformId: tistoryPlatform.id,
      fieldName: 'access_token',
      fieldLabel: 'Access Token',
      fieldType: 'password',
      isRequired: true,
      isEncrypted: true,
      placeholder: 'Access Token을 입력하세요',
      helpText: '티스토리 Access Token',
      displayOrder: 2,
    });
    console.log('✅ Platform fields created');

    console.log('\n✅ Database reset complete!');
    console.log('\n📋 Summary:');
    console.log('  - Admin user: admin@sh-system.co.kr / tjdgus66!');
    console.log('  - Platforms: Naver, Tistory');
    console.log('  - Platform fields configured');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();
