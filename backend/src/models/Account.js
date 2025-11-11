import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  platform: {
    type: DataTypes.ENUM('naver', 'tistory', 'velog', 'brunch'),
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isUrl: true,
    },
  },
  credentials_encrypted: {
    type: DataTypes.TEXT,
    comment: 'Encrypted login credentials',
  },
  api_key: {
    type: DataTypes.STRING(255),
  },
  post_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  daily_revenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  weekly_revenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  monthly_revenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  last_synced: {
    type: DataTypes.DATE,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'accounts',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['platform'] },
  ],
});

// Associations
User.hasMany(Account, { foreignKey: 'user_id', as: 'accounts' });
Account.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export default Account;
