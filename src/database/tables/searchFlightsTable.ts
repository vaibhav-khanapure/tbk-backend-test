import {Model,DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

interface SearchFlightTypes {
  id?: number;
  userId: number;
  flightFrom: string;
  flightTo: string;
  departureDate: Date;
  returnDate: Date;
  travelClass: string;
  travellerNumber: number;
};

class SearchFlights extends Model<SearchFlightTypes> {
 declare id?: number;
 declare userId: number;
 declare flightFrom: string;
 declare flightTo: string;
 declare departureDate: Date;
 declare returnDate: Date;
 declare travelClass: string;
 declare travellerNumber: number;
};

SearchFlights.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  flightFrom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  flightTo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  departureDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  returnDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  travelClass: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  travellerNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
},{
  sequelize,
  tableName: 'searchflights',
  timestamps: true,
});

export default SearchFlights;