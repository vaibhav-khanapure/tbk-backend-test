import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

// add Payment mode and transactionId

export interface LedgerType {
  id?: string;
  type: "Invoice" | "Credit" | "Debit" | "Credit Note" | "Debit Note" | "Refund" | "Miscellaneous" | "Other";
  InvoiceNo?: string;
  particulars: Object;
  debit: number;
  credit: number;
  balance: number;
  PaxName: string;
  addedBy: string;
  createdAt?: string;
  updatedAt?: string;

  userId: string;
};

class Ledgers extends Model<LedgerType> {
 declare id?: string;
 declare type: "Invoice" | "Credit" | "Debit" | "Credit Note" | "Debit Note" | "Refund" | "Miscellaneous" | "Other";
 declare InvoiceNo?: string;
 declare particulars: Object;
 declare debit: number;
 declare credit: number;
 declare balance: number;
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
  particulars: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  debit: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  credit: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  balance: {
    type: DataTypes.DECIMAL,
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
  updatedAt: false,
});

export default Ledgers;