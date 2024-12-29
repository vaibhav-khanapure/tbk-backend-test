import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

// add Payment mode and transactionId

export interface LedgerType {
  id?: string;
  type: "Invoice" | "Credit" | "Debit" | "Credit Note" | "Debit Note" | "Refund" | "Miscellaneous" | "Other";
  TransactionId: string;
  paymentMethod: string;
  InvoiceNo?: string;
  particulars: Object;
  debit: number | string;
  credit: number | string;
  balance: number | string;
  PaxName: string;
  addedBy: string;

  createdAt?: string;
  updatedAt?: string;

  userId: string;
};

class Ledgers extends Model<LedgerType> {
 declare id?: string;
 declare type: "Invoice" | "Credit" | "Debit" | "Credit Note" | "Debit Note" | "Refund" | "Miscellaneous" | "Other";   
 declare TransactionId: string;
 declare paymentMethod: string;
 declare InvoiceNo?: string;
 declare particulars: Object;
 declare debit: number | string;
 declare credit: number | string;
 declare balance: number | string;
 declare PaxName: string;
 declare addedBy: string;
 declare createdAt?: string;
 declare updatedAt?: string;

 declare userId: string;
};

Ledgers.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  type: {
    type: DataTypes.ENUM("Invoice", "Credit", "Debit", "Credit Note", "Debit Note", "Refund", "Miscellaneous", "Other"),
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  TransactionId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  particulars: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  debit: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: true,
  },
  credit: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: true,
  },
  balance: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  PaxName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  InvoiceNo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  addedBy: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  }
}, {
  sequelize,
  tableName: 'ledgers',
  timestamps: true,
  updatedAt: true,
});

export default Ledgers;