import {Model,DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

interface AirportListTypes {
  id?: string;
  cityName?: string;
  cityCode?: string;
  countryCode?: string;
  airportCode?: string;
  countryName?: string;
  airportName?: string | null;
};

class AirportList extends Model<AirportListTypes> {
  declare id?: string;
  declare cityName?: string;
  declare cityCode?: string;
  declare countryCode?: string;
  declare airportCode?: string;
  declare countryName?: string;
  declare airportName?: string | null;
};

AirportList.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
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
  tableName: 'airportList',
  timestamps: false,
});

export default AirportList;