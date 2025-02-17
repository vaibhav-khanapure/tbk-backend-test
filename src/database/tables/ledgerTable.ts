import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';

export interface LedgerType {
  id?: number;
  userId: number;

  type: "Invoice" | "Credit" | "Debit" | "Credit Note" | "Debit Note" | "Refund" | "Miscellaneous" | "Other";
  reason: string;
  TransactionId: string;
  paymentMethod: string;
  InvoiceNo?: string;
  particulars: Record<string, string>;
  debit: number | string;
  credit: number | string;
  balance: number | string;
  PaxName: string;
  addedBy: number;
  updatedBy?: number;

  created_at?: string;
  updated_at?: string;
};

class Ledgers extends Model<LedgerType> {
  declare id?: number;
  declare userId: number;

  declare type: "Invoice" | "Credit" | "Debit" | "Credit Note" | "Debit Note" | "Refund" | "Miscellaneous" | "Other";
  declare reason: string;
  declare TransactionId: string;
  declare paymentMethod: string;
  declare InvoiceNo?: string;
  declare particulars: Record<string, string>;
  declare debit: number | string;
  declare credit: number | string;
  declare balance: number | string;
  declare PaxName: string;
  declare addedBy: number;
  declare updatedBy?: number;

  declare created_at?: string;
  declare updated_at?: string;
};

Ledgers.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("Invoice", "Credit", "Debit", "Credit Note", "Debit Note", "Refund", "Miscellaneous", "Other"),
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
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
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  sequelize,
  tableName: 'ledgers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Ledgers;