import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

interface DiscountTypes {
 id?: number;
 userId: number;

 fareType: string;
 dicount: number;
 markup: number;
 createdBy: string;
 updatedBy: string;

 createdAt?: Date;
 updatedAt?: Date;
};

class Discounts extends Model<DiscountTypes> {
 declare id?: number;
 declare userId: number;

 declare fareType: string;
 declare dicount: number;
 declare markup: number;
 declare createdBy: string;
 declare updatedBy: string;

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
  dicount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  markup: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  updatedBy: {
    type: DataTypes.INTEGER,
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