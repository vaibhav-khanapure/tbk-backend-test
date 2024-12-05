import {Model,DataTypes} from 'sequelize';
import User from './usersTable';
import sequelize from '../../config/sql';

interface UnsuccessfulFlightsTypes {
  id?: string;
  totalAmount?: string;
  bookedDate?: Date;
  flightStatus?: string;
  userId: string;
  Origin?: string;
  Destination?: string;
  OriginDate?: Date;
  DestinationDate?: Date;
};

class UnsuccessfullFlights extends Model<UnsuccessfulFlightsTypes> {
  public id?: string;
  public totalAmount?: string;
  public bookedDate?: Date;
  public flightStatus?: string;
  public userId!: string;
  public Origin?: string;
  public Destination?: string;
  public OriginDate?: Date;
  public DestinationDate?: Date;
  public user?: User;
}

UnsuccessfullFlights.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  totalAmount: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bookedDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  flightStatus: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    // references: {
    //   model: User,
    //   key: 'id',
    // },
  },
  Origin: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Destination: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  OriginDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  DestinationDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
},{
  sequelize,
  tableName: 'unsuccessfullFlights',
  timestamps: true,
});

// UnsuccessfullFlights.belongsTo(User,{foreignKey: 'userId',as: 'users'});

export default UnsuccessfullFlights;