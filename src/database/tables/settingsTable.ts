import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

interface SettingTypes {
 id?: string;
 TboTokenId: string;
 flightDiscount: number;
 hotelDiscount: number;
};

class Settings extends Model<SettingTypes> {
 declare id?: string;
 declare TboTokenId: string;
 declare flightDiscount: number;
 declare hotelDiscount: number;
};

Settings.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  TboTokenId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  flightDiscount: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  hotelDiscount: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
},{
  sequelize,
  tableName: 'settings',
  timestamps: false,
});

export default Settings;