import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';
import User from './usersTable';

interface BookingDetailsTypes {
  id?: string;
  bookingId: string;
  TraceId: string;
  PNR: string;
  totalAmount: string;
  InvoiceAmount: string;
  bookedDate: Date;
  InvoiceNo: string;
  InvoiceId: string;
  IsLCC: boolean;
  flightStatus?: string;
  changeRequestId?: string;
  Segments: object;
  Passenger: object;
  userId: string;
};

class BookingDetails extends Model<BookingDetailsTypes> {
  public id!: string;
  public bookingId!: string;
  public TraceId!: string;
  public PNR!: string;
  public totalAmount!: string;
  public InvoiceAmount!: string;
  public bookedDate!: Date;
  public InvoiceNo!: string;
  public InvoiceId!: string;
  public IsLCC!: boolean;
  public flightStatus?: string;
  public changeRequestId?: string;
  public Segments!: object;
  public Passenger!: object;
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
  totalAmount: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  InvoiceAmount: {
    type: DataTypes.STRING,
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
  InvoiceId: {
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
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
}, {
  sequelize,
  modelName: 'bookingDetails',
  timestamps: true,
});

BookingDetails.belongsTo(User, { foreignKey: 'userId', as: 'users' });

export default BookingDetails;