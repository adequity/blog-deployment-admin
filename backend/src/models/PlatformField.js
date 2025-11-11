import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Platform from './Platform.js';

const PlatformField = sequelize.define('PlatformField', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  platformId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'platforms',
      key: 'id',
    },
    onDelete: 'CASCADE',
    comment: '플랫폼 ID',
  },
  fieldName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '필드 이름 (예: accountId, password, apiKey)',
  },
  fieldLabel: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '필드 표시명 (예: 계정 아이디, 비밀번호, API 키)',
  },
  fieldType: {
    type: DataTypes.ENUM('text', 'password', 'email', 'url', 'number', 'textarea', 'select'),
    allowNull: false,
    defaultValue: 'text',
    comment: '필드 입력 타입',
  },
  placeholder: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '플레이스홀더 텍스트',
  },
  helpText: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '도움말 텍스트',
  },
  isRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '필수 입력 여부',
  },
  isEncrypted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '암호화 저장 여부',
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '표시 순서',
  },
  validation: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '유효성 검증 규칙 (JSON)',
  },
  options: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'select 타입일 경우 선택 옵션 (JSON)',
  },
}, {
  tableName: 'platform_fields',
  timestamps: true,
  indexes: [
    { fields: ['platform_id'] },
    { fields: ['platform_id', 'field_name'], unique: true },
    { fields: ['display_order'] },
  ],
});

// Associations
Platform.hasMany(PlatformField, { foreignKey: 'platformId', as: 'fields' });
PlatformField.belongsTo(Platform, { foreignKey: 'platformId', as: 'platform' });

export default PlatformField;
