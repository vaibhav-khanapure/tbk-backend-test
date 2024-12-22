import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

export interface TicketCRInfo {
  ChangeRequestId: number;
  TicketId: number;
  Status: number;
  Remarks: string;
  ChangeRequestStatus: number;
  CancellationCharge: number;
  RefundedAmount: number;
  ServiceTaxOnRAF: number;
  SwachhBharatCess: number;
  KrishiKalyanCess: number;
  CreditNoteNo: string;
  CreditNoteCreatedOn: string; // Consider using Date type for better type safety
};

interface CancelledFlightsTypes {
 id?: string;
 bookingId: number;
 TicketId?: number[];
 TicketCRInfo: TicketCRInfo[];
 RefundCreditedOn?: Date;
 RefundProcessedOn?: Date;
 RefundStatus: "Pending" | "Rejected" | "Accepted";
 cancellationType: "Full" | "Partial";
 createdAt?: Date;
 updatedAt?: Date;

 userId: string;
};

class CancelledFlights extends Model<CancelledFlightsTypes> {
 declare id?: string;
 declare bookingId: number;
 declare TicketId?: number[];
 declare TicketCRInfo: TicketCRInfo[];
 declare RefundCreditedOn: Date;
 declare RefundProcessedOn: Date;
 declare RefundStatus: "Pending" | "Rejected" | "Accepted";
 declare cancellationType: "Full" | "Partial";
 declare createdAt?: Date;
 declare updatedAt?: Date;

 declare userId: string;
};

CancelledFlights.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
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
  RefundCreditedOn: {
   type: DataTypes.DATE,
   allowNull: true, 
  },
  RefundProcessedOn: {
   type: DataTypes.DATE,
   allowNull: true, 
  },
  cancellationType: {
   type: DataTypes.ENUM("Full", "Partial"),
   allowNull: false,
  },
  TicketId: {
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
  tableName: 'cancelledflights',
  timestamps: true,
});

// CancelledFlights.belongsTo(User, { foreignKey: 'userId', as: 'users', onDelete: "CASCADE", onUpdate: "CASCADE" });

export default CancelledFlights;