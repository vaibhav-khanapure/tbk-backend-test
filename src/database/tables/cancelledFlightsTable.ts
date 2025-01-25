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
  CreditNoteCreatedOn: string;
};

export interface cancelledTicket {
 TicketId: number;
 TicketCRInfo: TicketCRInfo,
 RefundedAmount: number | string;
 RefundedDate: Date | string;
 RefundCreditedOn?: Date | string;
 RefundProcessedOn?: Date | string;
 RefundStatus: "Pending" | "Rejected" | "Accepted";
};

interface CancelledFlightsTypes {
 id?: string;
 bookingId: number;
 cancellationType: "Full" | "Partial";
 cancelledTickets: cancelledTicket[];

 createdAt?: Date;
 updatedAt?: Date;

 userId: string;
};

class CancelledFlights extends Model<CancelledFlightsTypes> {
 declare id?: string;
 declare bookingId: number;
 declare cancellationType: "Full" | "Partial";
 declare cancelledTickets: cancelledTicket[];
 
 declare createdAt?: Date;
 declare updatedAt?: Date;
 
 declare userId: string;
};

CancelledFlights.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUID,
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cancelledTickets: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  cancellationType: {
   type: DataTypes.ENUM("Full", "Partial"),
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