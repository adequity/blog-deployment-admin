import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import BlogAccount from './BlogAccount.js';
import PlatformField from './PlatformField.js';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.FIELD_ENCRYPTION_KEY || 'default-encryption-key-change-me-32';
const ALGORITHM = 'aes-256-cbc';

const AccountFieldData = sequelize.define('AccountFieldData', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  blogAccountId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'blog_accounts',
      key: 'id',
    },
    onDelete: 'CASCADE',
    comment: '블로그 계정 ID',
  },
  platformFieldId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'platform_fields',
      key: 'id',
    },
    onDelete: 'CASCADE',
    comment: '플랫폼 필드 ID',
  },
  fieldValue: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '필드 값 (암호화될 수 있음)',
  },
  isEncrypted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '암호화 여부',
  },
}, {
  tableName: 'account_field_data',
  timestamps: true,
  indexes: [
    { fields: ['blogAccountId'] },
    { fields: ['platformFieldId'] },
    { fields: ['blogAccountId', 'platformFieldId'], unique: true },
  ],
});

// Helper methods for encryption/decryption
AccountFieldData.encryptValue = function(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

AccountFieldData.decryptValue = function(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Associations
BlogAccount.hasMany(AccountFieldData, { foreignKey: 'blogAccountId', as: 'fieldData' });
AccountFieldData.belongsTo(BlogAccount, { foreignKey: 'blogAccountId', as: 'blogAccount' });

PlatformField.hasMany(AccountFieldData, { foreignKey: 'platformFieldId', as: 'accountData' });
AccountFieldData.belongsTo(PlatformField, { foreignKey: 'platformFieldId', as: 'field' });

export default AccountFieldData;
