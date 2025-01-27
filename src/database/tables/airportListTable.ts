import {Model,DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

interface AirportListTypes {
  id?: number;
  cityName?: string;
  cityCode?: string;
  countryCode?: string;
  airportCode?: string;
  countryName?: string;
  airportName?: string;
};

class AirportList extends Model<AirportListTypes> {
 declare id?: number;
 declare cityName?: string;
 declare cityCode?: string;
 declare countryCode?: string;
 declare airportCode?: string;
 declare countryName?: string;
 declare airportName?: string;
};

AirportList.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  cityName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cityCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  countryCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  airportCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  countryName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  airportName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
},{
  sequelize,
  tableName: 'airportlist',
  timestamps: false,
});

export default AirportList;