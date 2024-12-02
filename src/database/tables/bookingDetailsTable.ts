import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';
import User from './usersTable';

export interface BookingDetailsTypes {
  id?: string;
  bookingId: string;
  TraceId: string;
  PNR: string;
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
  cancellationType: "Full" | "Partial";
  cancelledPassengers: object;
  userId: string;
};

class BookingDetails extends Model<BookingDetailsTypes> {
  public id!: string;
  public bookingId!: string;
  public TraceId!: string;
  public PNR!: string;
  public tboAmount!: number;
  public tbkAmount!: number;
  public bookedDate!: Date;
  public InvoiceNo!: string;
  public InvoiceId!: number;
  public IsLCC!: boolean;
  public flightStatus?: string;
  public changeRequestId?: string;
  public Segments!: object;
  public Passenger!: object;
  public cancelledPassengers?: object;
  public userId!: string;
  public user?: User;
};

BookingDetails.init({
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
  InvoiceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // references: {
    //   model: Invoices,
    //   key: "id",
    // },
  },
  cancellationType: {
    type: DataTypes.ENUM("Full", "Partial"),
    allowNull: true,
  },
  cancelledPassengers: {
    type: DataTypes.JSON,
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
}, {
  sequelize,
  modelName: 'bookingDetails',
  timestamps: true,
});

// BookingDetails.belongsTo(User, { foreignKey: 'userId', as: 'users', });

export default BookingDetails;