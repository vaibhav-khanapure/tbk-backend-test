import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';

export interface LedgerType {
  id?: string;
  type: "Invoice" | "Credit" | "Debit" | "Credit Note" | "Debit Note" | "Refund" | "Miscellaneous" | "Other";
  InvoiceNo: string;
  particulars: Object;
  debit: number;
  credit: number;
  balance: number;
  PaxName: string;
  addedBy: string;
  userId: string;
};

class Ledgers extends Model<LedgerType> {
 declare id?: string;
 declare type: "Invoice" | "Credit" | "Debit" | "Credit Note" | "Debit Note" | "Refund" | "Miscellaneous" | "Other";
 declare InvoiceNo: string;
 declare particulars: Object;
 declare debit: number;
 declare credit: number;
 declare balance: number;
 declare PaxName: string;
 declare addedBy: string;
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
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  credit: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  balance: {
    type: DataTypes.INTEGER,
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
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  sequelize,
  tableName: 'ledgers',
  timestamps: true,
  updatedAt: false,
});

export default Ledgers;