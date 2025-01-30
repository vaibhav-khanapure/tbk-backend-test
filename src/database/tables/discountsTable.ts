import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

interface DiscountTypes {
 id?: number;
 userId: number;

 fareType: string;
 discount: number;
 markup?: number;
 createdBy?: string;
 updatedBy?: number;
 master?: boolean;
 approved?: boolean;
 isDefault?: boolean;

 createdAt?: Date;
 updatedAt?: Date;
};

class Discounts extends Model<DiscountTypes> {
 declare id?: number;
 declare userId: number;

 declare fareType: string;
 declare discount: number;
 declare markup: number;
 declare createdBy: string;
 declare updatedBy: number;
 declare master: boolean;
 declare approved?: boolean;
 declare isDefault?: boolean;

 declare createdAt?: Date;
 declare updatedAt?: Date;
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
    allowNull: false,
  }
},{
  sequelize,
  tableName: 'discounts',
  timestamps: true,
});

export default Discounts;