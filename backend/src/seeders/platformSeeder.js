import sequelize from '../config/database.js';
import Platform from '../models/Platform.js';
import PlatformField from '../models/PlatformField.js';

const initialPlatforms = [
  {
    name: 'naver',
    displayName: '네이버 블로그',
    description: '네이버 블로그 플랫폼',
    icon: '📝',
    isActive: true,
    fields: [
      {
        fieldName: 'accountId',
        fieldLabel: '계정 아이디',
        fieldType: 'text',
        placeholder: '네이버 아이디를 입력하세요',
        isRequired: true,
        isEncrypted: false,
        displayOrder: 0,
      },
      {
        fieldName: 'accountPassword',
        fieldLabel: '계정 비밀번호',
        fieldType: 'password',
        placeholder: '네이버 비밀번호를 입력하세요',
        isRequired: true,
        isEncrypted: true,
        displayOrder: 1,
      },
    ],
  },
  {
    name: 'tistory',
    displayName: '티스토리',
    description: '티스토리 블로그 플랫폼',
    icon: '💭',
    isActive: true,
    fields: [
      {
        fieldName: 'accountId',
        fieldLabel: '계정 아이디',
        fieldType: 'text',
        placeholder: '티스토리 아이디를 입력하세요',
        isRequired: true,
        isEncrypted: false,
        displayOrder: 0,
      },
      {
        fieldName: 'accountPassword',
        fieldLabel: '계정 비밀번호',
        fieldType: 'password',
        placeholder: '티스토리 비밀번호를 입력하세요',
        isRequired: true,
        isEncrypted: true,
        displayOrder: 1,
      },
    ],
  },
  {
    name: 'velog',
    displayName: '벨로그',
    description: '개발자를 위한 블로그 플랫폼',
    icon: '🔧',
    isActive: true,
    fields: [
      {
        fieldName: 'accountId',
        fieldLabel: '계정 아이디',
        fieldType: 'text',
        placeholder: '벨로그 아이디를 입력하세요',
        isRequired: true,
        isEncrypted: false,
        displayOrder: 0,
      },
      {
        fieldName: 'accountPassword',
        fieldLabel: '계정 비밀번호',
        fieldType: 'password',
        placeholder: '벨로그 비밀번호를 입력하세요',
        isRequired: true,
        isEncrypted: true,
        displayOrder: 1,
      },
    ],
  },
  {
    name: 'medium',
    displayName: '미디엄',
    description: 'Medium 블로그 플랫폼',
    icon: '📰',
    isActive: true,
    fields: [
      {
        fieldName: 'accountId',
        fieldLabel: '계정 아이디',
        fieldType: 'email',
        placeholder: 'email@example.com',
        isRequired: true,
        isEncrypted: false,
        displayOrder: 0,
      },
      {
        fieldName: 'accountPassword',
        fieldLabel: '계정 비밀번호',
        fieldType: 'password',
        placeholder: '미디엄 비밀번호를 입력하세요',
        isRequired: true,
        isEncrypted: true,
        displayOrder: 1,
      },
    ],
  },
  {
    name: 'brunch',
    displayName: '브런치',
    description: '카카오 브런치 플랫폼',
    icon: '☕',
    isActive: true,
    fields: [
      {
        fieldName: 'accountId',
        fieldLabel: '계정 아이디',
        fieldType: 'text',
        placeholder: '카카오 계정 아이디를 입력하세요',
        isRequired: true,
        isEncrypted: false,
        displayOrder: 0,
      },
      {
        fieldName: 'accountPassword',
        fieldLabel: '계정 비밀번호',
        fieldType: 'password',
        placeholder: '카카오 계정 비밀번호를 입력하세요',
        isRequired: true,
        isEncrypted: true,
        displayOrder: 1,
      },
    ],
  },
];

export const seedPlatforms = async () => {
  try {
    console.log('🌱 Seeding platforms...');

    for (const platformData of initialPlatforms) {
      const { fields, ...platformInfo } = platformData;

      // 플랫폼 존재 확인
      let platform = await Platform.findOne({
        where: { name: platformInfo.name },
      });

      if (!platform) {
        // 플랫폼 생성
        platform = await Platform.create(platformInfo);
        console.log(`✅ Created platform: ${platformInfo.displayName}`);

        // 필드 생성
        if (fields && fields.length > 0) {
          const platformFields = fields.map(field => ({
            ...field,
            platformId: platform.id,
          }));

          await PlatformField.bulkCreate(platformFields);
          console.log(`   ✅ Created ${fields.length} fields for ${platformInfo.displayName}`);
        }
      } else {
        console.log(`⏭️  Platform already exists: ${platformInfo.displayName}`);
      }
    }

    console.log('✅ Platform seeding completed!');
  } catch (error) {
    console.error('❌ Platform seeding error:', error);
    throw error;
  }
};

// 직접 실행 시
if (import.meta.url === `file://${process.argv[1]}`) {
  seedPlatforms()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
