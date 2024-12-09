import {Model,DataTypes} from 'sequelize';
import User from './usersTable';
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
  createdAt?: Date;
  updatedAt?: Date;
};

class SearchFlights extends Model<SearchFlightTypes> {
  public id!: string;
  public userId!: string;
  public flightFrom!: string;
  public flightTo!: string;
  public departureDate!: Date;
  public returnDate!: Date;
  public travelClass!: string;
  public travellerNumber!: number;
  public createdAt?: Date;
  public updatedAt?: Date;
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
  tableName: 'searchFlights',
  timestamps: true,
});

// SearchFlights.belongsTo(User,{foreignKey: 'userId', as: 'users', onDelete: "CASCADE", onUpdate: "CASCADE" });

export default SearchFlights;