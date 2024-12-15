import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';

interface CancelledFlightsTypes {
  id?: string;
  cancellationDate: Date;
  bookingId: number;
  bookingAmount: number;
  TicketCRInfo: JSON;
  RefundStatus: "Pending" | "Rejected" | "Accepted";
  cancellationType: "Full" | "Partial";
  TraceId: string;

  userId: string;
};

class CancelledFlights extends Model<CancelledFlightsTypes> {
 declare id?: string;
 declare cancellationDate: Date;
 declare bookingId: number;
 declare bookingAmount: number;
 declare TicketCRInfo: JSON;
 declare RefundStatus: "Pending" | "Rejected" | "Accepted";
 declare cancellationType: "Full" | "Partial";
 declare TraceId: string;

 declare userId: string;
};

CancelledFlights.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  cancellationDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  bookingAmount: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  TicketCRInfo: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  RefundStatus: {
    type: DataTypes.ENUM("Pending", "Rejected", "Accepted"),
    allowNull: false,
  },
  cancellationType: {
   type: DataTypes.ENUM("Full", "Partial"),
   allowNull: false,
  },
  TraceId: {
    type: DataTypes.STRING,
    allowNull: false,
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
  tableName: 'cancelledflights',
  timestamps: true,
});

// CancelledFlights.belongsTo(User, { foreignKey: 'userId', as: 'users', onDelete: "CASCADE", onUpdate: "CASCADE" });

export default CancelledFlights;