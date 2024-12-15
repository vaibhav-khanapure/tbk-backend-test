import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';

export interface FlightBookingTypes {
  id?: string;
  bookingId: string;
  TraceId: string;
  PNR: string;
  isFlightCombo: boolean;
  tboAmount: number;
  tbkAmount: number;
  bookedDate: Date;
  InvoiceNo: string;
  InvoiceId: number;
  IsLCC: boolean;
  flightStatus?: string;
  Segments: object;
  Passenger: object;
  flightCities?: object;
  cancelledTickets: object;
  userId: string;
};

class FlightBookings extends Model<FlightBookingTypes> {
  declare id?: string;
  declare bookingId: string;
  declare TraceId: string;
  declare PNR: string;
  declare isFlightCombo: boolean;
  declare tboAmount: number;
  declare tbkAmount: number;
  declare bookedDate: Date;
  declare InvoiceNo: string;
  declare InvoiceId: number;
  declare IsLCC: boolean;
  declare flightStatus?: string;
  declare Segments: object;
  declare Passenger: object;
  declare flightCities?: object;
  declare cancelledTickets: object;
  declare userId: string;
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
  isFlightCombo: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  flightCities: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  tboAmount: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  tbkAmount: {
    type: DataTypes.DECIMAL,
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
  Segments: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  Passenger: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  cancelledTickets: {
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
  modelName: 'flightbookings',
  timestamps: true,
});

// BookingDetails.belongsTo(User, { foreignKey: 'userId', as: 'users', onDelete: "CASCADE", onUpdate: "CASCADE" });

export default FlightBookings;