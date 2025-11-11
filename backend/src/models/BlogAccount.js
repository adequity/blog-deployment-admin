import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Platform from './Platform.js';

const BlogAccount = sequelize.define('BlogAccount', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    comment: '사용자 ID',
  },
  platformId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'platforms',
      key: 'id',
    },
    onDelete: 'RESTRICT',
    comment: '플랫폼 ID',
  },
  accountName: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '계정 별칭 (사용자가 지정하는 이름)',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '계정 활성화 여부',
  },
  lastSyncedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '마지막 동기화 시간',
  },
  syncStatus: {
    type: DataTypes.ENUM('pending', 'syncing', 'success', 'failed'),
    defaultValue: 'pending',
    comment: '동기화 상태',
  },
  syncErrorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '동기화 에러 메시지',
  },
}, {
  tableName: 'blog_accounts',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['platform_id'] },
    { fields: ['user_id', 'platform_id'] },
    { fields: ['is_active'] },
  ],
});

// Associations
User.hasMany(BlogAccount, { foreignKey: 'userId', as: 'blogAccounts' });
BlogAccount.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Platform.hasMany(BlogAccount, { foreignKey: 'platformId', as: 'blogAccounts' });
BlogAccount.belongsTo(Platform, { foreignKey: 'platformId', as: 'platform' });

export default BlogAccount;
