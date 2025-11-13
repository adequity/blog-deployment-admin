import sequelize from '../config/database.js';
import Platform from '../models/Platform.js';
import PlatformField from '../models/PlatformField.js';

const initialPlatforms = [
  {
    name: 'naver',
    displayName: 'Naver Blog',
    description: 'Naver Blog Platform',
    icon: '📝',
    isActive: true,
    fields: [
      {
        fieldName: 'accountId',
        fieldLabel: 'Account ID',
        fieldType: 'text',
        placeholder: 'Enter your Naver ID',
        isRequired: true,
        isEncrypted: false,
        displayOrder: 0,
      },
      {
        fieldName: 'accountPassword',
        fieldLabel: 'Account Password',
        fieldType: 'password',
        placeholder: 'Enter your Naver password',
        isRequired: true,
        isEncrypted: true,
        displayOrder: 1,
      },
    ],
  },
  {
    name: 'tistory',
    displayName: 'Tistory',
    description: 'Tistory Blog Platform',
    icon: '💭',
    isActive: true,
    fields: [
      {
        fieldName: 'accountId',
        fieldLabel: 'Account ID',
        fieldType: 'text',
        placeholder: 'Enter your Tistory ID',
        isRequired: true,
        isEncrypted: false,
        displayOrder: 0,
      },
      {
        fieldName: 'accountPassword',
        fieldLabel: 'Account Password',
        fieldType: 'password',
        placeholder: 'Enter your Tistory password',
        isRequired: true,
        isEncrypted: true,
        displayOrder: 1,
      },
    ],
  },
  {
    name: 'velog',
    displayName: 'Velog',
    description: 'Blog Platform for Developers',
    icon: '🔧',
    isActive: true,
    fields: [
      {
        fieldName: 'accountId',
        fieldLabel: 'Account ID',
        fieldType: 'text',
        placeholder: 'Enter your Velog ID',
        isRequired: true,
        isEncrypted: false,
        displayOrder: 0,
      },
      {
        fieldName: 'accountPassword',
        fieldLabel: 'Account Password',
        fieldType: 'password',
        placeholder: 'Enter your Velog password',
        isRequired: true,
        isEncrypted: true,
        displayOrder: 1,
      },
    ],
  },
  {
    name: 'medium',
    displayName: 'Medium',
    description: 'Medium Blog Platform',
    icon: '📰',
    isActive: true,
    fields: [
      {
        fieldName: 'accountId',
        fieldLabel: 'Account ID',
        fieldType: 'email',
        placeholder: 'email@example.com',
        isRequired: true,
        isEncrypted: false,
        displayOrder: 0,
      },
      {
        fieldName: 'accountPassword',
        fieldLabel: 'Account Password',
        fieldType: 'password',
        placeholder: 'Enter your Medium password',
        isRequired: true,
        isEncrypted: true,
        displayOrder: 1,
      },
    ],
  },
  {
    name: 'brunch',
    displayName: 'Brunch',
    description: 'Kakao Brunch Platform',
    icon: '☕',
    isActive: true,
    fields: [
      {
        fieldName: 'accountId',
        fieldLabel: 'Account ID',
        fieldType: 'text',
        placeholder: 'Enter your Kakao account ID',
        isRequired: true,
        isEncrypted: false,
        displayOrder: 0,
      },
      {
        fieldName: 'accountPassword',
        fieldLabel: 'Account Password',
        fieldType: 'password',
        placeholder: 'Enter your Kakao account password',
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
