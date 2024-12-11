import {Model,DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

interface SearchFlightTypes {
  id?: string;
  userId: string;
  flightFrom: string;
  flightTo: string;
  departureDate: Date;
  returnDate: Date;
  travelClass: string;
  travellerNumber: number;
};

class SearchFlights extends Model<SearchFlightTypes> {
 declare id?: string;
 declare userId: string;
 declare flightFrom: string;
 declare flightTo: string;
 declare departureDate: Date;
 declare returnDate: Date;
 declare travelClass: string;
 declare travellerNumber: number;
};

SearchFlights.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
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
    type: DataTypes.UUID,
    allowNull: false,
    // references: {
    //   model: User,
    //   key: 'id',
    //  },
  },
},{
  sequelize,
  tableName: 'searchflights',
  timestamps: true,
});

// SearchFlights.belongsTo(User,{foreignKey: 'userId', as: 'users', onDelete: "CASCADE", onUpdate: "CASCADE" });

export default SearchFlights;