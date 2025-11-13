import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
    },
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      is: /^[0-9-+()]*$/,
    },
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'user',
    allowNull: false,
    validate: {
      isIn: [['user', 'moderator', 'admin']],
    },
    comment: '사용자 권한 (user: 일반 사용자, moderator: 운영자/레퍼럴 관리자, admin: 관리자)',
  },
  last_login: {
    type: DataTypes.DATE,
  },
  // 정산 정보
  bank_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '은행명',
  },
  account_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '계좌번호',
  },
  account_holder: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '예금주명',
  },
  // 신분 정보 (이미지 파일 업로드)
  real_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '실명',
  },
  id_type: {
    type: DataTypes.STRING(30),
    allowNull: true,
    validate: {
      isIn: [['resident_card', 'driver_license', 'passport']],
    },
    comment: '신분증 종류 (resident_card: 주민등록증, driver_license: 운전면허증, passport: 여권)',
  },
  id_image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '신분증 이미지 URL (S3/Cloudinary)',
  },
  id_image_key: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '신분증 이미지 저장소 키 (삭제용)',
  },
  id_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '신분증 인증 여부',
  },
  id_verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '신분증 인증 일시',
  },
  // 레퍼럴 시스템
  referred_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
    comment: '추천인 (moderator) ID',
  },
  referral_code: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    comment: 'Moderator가 사용할 고유 추천 코드',
  },
}, {
  tableName: 'users',
  indexes: [
    { fields: ['username'] },
    { fields: ['email'] },
    { fields: ['role'] },
    { fields: ['referred_by'] },
    { fields: ['referral_code'] },
  ],
});

// Instance methods
User.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password_hash;
  // 민감정보는 암호화된 상태로만 반환 (필요시 별도 복호화)
  return values;
};

// Class methods
User.hashPassword = async function(password) {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

export default User;
