import {Model,DataTypes} from 'sequelize';
import User from './usersTable';
import sequelize from '../../config/sql';

interface SearchFlightTypes {
  id?: string;
  userId: string;
  FlightFrom: string;
  FlightTo: string;
  DepartureDate: Date;
  ReturnDate: Date;
  travelClass: string;
  TravellerNumber: number;
  createdAt: Date;
  updatedAt: Date;
};

class SearchFlights extends Model<SearchFlightTypes> {
  public id!: string;
  public userId!: string;
  public FlightFrom!: string;
  public FlightTo!: string;
  public DepartureDate!: Date;
  public ReturnDate!: Date;
  public travelClass!: string;
  public TravellerNumber!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
};

SearchFlights.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
     },
  },
  FlightFrom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  FlightTo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  DepartureDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  ReturnDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  travelClass: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  TravellerNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
},{
  sequelize,
  tableName: 'searchFlights',
  timestamps: false,
});

SearchFlights.belongsTo(User,{foreignKey: 'userId',as: 'users'});

export default SearchFlights;