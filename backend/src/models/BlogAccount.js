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
    comment: 'User ID',
  },
  platformId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'platforms',
      key: 'id',
    },
    onDelete: 'RESTRICT',
    comment: 'Platform ID',
  },
  accountName: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Account alias (user-defined name)',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Account activation status',
  },
  lastSyncedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last synchronization time',
  },
  syncStatus: {
    type: DataTypes.ENUM('pending', 'syncing', 'success', 'failed'),
    defaultValue: 'pending',
    comment: 'Synchronization status',
  },
  syncErrorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '동기화 에러 메시지',
  },
}, {
  tableName: 'blog_accounts',
  timestamps: true,
  underscored: true,
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
