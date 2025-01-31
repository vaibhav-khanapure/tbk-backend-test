import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

interface SettingTypes {
 id?: string;
 uuid?: string;
 ResultIndex: string;
 oldPublishedFare: string;
 newPublishedFare?: string;
 isPriceChanged?: boolean;
};

class FareQuotes extends Model<SettingTypes> {
 declare id?: string;
 declare uuid?: string;
 declare ResultIndex: string;
 declare oldPublishedFare: string;
 declare newPublishedFare: string;
 declare isPriceChanged?: boolean;
};

FareQuotes.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  uuid: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ResultIndex: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  oldPublishedFare: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: true,
  },
  newPublishedFare: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: true
  },
  isPriceChanged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
},{
  sequelize,
  tableName: 'farequotes',
  timestamps: true,
});

export default FareQuotes;