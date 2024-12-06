import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';
import User from './usersTable';

export interface FlightBookingTypes {
  id?: string;
  bookingId: string;
  TraceId: string;
  PNR: string;
  isFlightInternational: boolean;
  tboAmount: number;
  tbkAmount: number;
  bookedDate: Date;
  InvoiceNo: string;
  InvoiceId: number;
  IsLCC: boolean;
  flightStatus?: string;
  changeRequestId?: string;
  Segments: object;
  Passenger: object;
  flightCities?: object;
  cancelledPassengers: object;
  userId: string;
};

class FlightBookings extends Model<FlightBookingTypes> {
  public id!: string;
  public bookingId!: string;
  public TraceId!: string;
  public PNR!: string;
  public tboAmount!: number;
  public isFlightInternational!: boolean;
  public tbkAmount!: number;
  public bookedDate!: Date;
  public InvoiceNo!: string;
  public InvoiceId!: number;
  public IsLCC!: boolean;
  public flightStatus?: string;
  public changeRequestId?: string;
  public Segments!: object;
  public Passenger!: object;
  public flightCities?: object;
  public cancelledPassengers?: object;
  public userId!: string;
  public user?: User;
};

FlightBookings.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  bookingId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  TraceId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  PNR: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isFlightInternational: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  flightCities: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  tboAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tbkAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bookedDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  InvoiceNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  IsLCC: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  flightStatus: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  changeRequestId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Segments: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  Passenger: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  cancelledPassengers: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  InvoiceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // references: {
    //   model: Invoices,
    //   key: "id",
    // },
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    // references: {
    //   model: User,
    //   key: 'id',
    // },
  },
}, {
  sequelize,
  modelName: 'flightBookings',
  timestamps: true,
});

// BookingDetails.belongsTo(User, { foreignKey: 'userId', as: 'users', });

export default FlightBookings;