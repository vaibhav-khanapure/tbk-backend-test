import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';

interface DiscountTypes {
  id?: number;
  userId?: number;
  groupId?: number;
  coins?: number;
  coinsValueType?: number;

  fareType: string;
  discount: number;
  markup?: number;
  createdBy?: string;
  updatedBy?: number;
  master?: boolean;
  approved?: boolean;
  isDefault?: boolean;

  created_at?: Date;
  updated_at?: Date;
};

class Discounts extends Model<DiscountTypes> {
  declare id?: number;
  declare userId: number;
  declare groupId?: number;
  declare coins?: number;
  declare coinsValueType?: string;

  declare fareType: string;
  declare discount: number;
  declare markup?: number;
  declare createdBy?: string;
  declare updatedBy?: number;
  declare master?: boolean;
  declare approved?: boolean;
  declare isDefault?: boolean;

  declare created_at?: Date;
  declare updated_at?: Date;
};

Discounts.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  fareType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  discount: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  markup: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  coins: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  coinsValueType: {
    type: DataTypes.STRING,
    defaultValue: 'Percentage'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  master: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  },
  approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  sequelize,
  tableName: 'discounts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Discounts;