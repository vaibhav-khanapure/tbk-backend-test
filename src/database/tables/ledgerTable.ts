const table = {
 id: "",
 type: true ? "Refund" : "Receipt",
 createdAt: "",
 TxReferenceId: "Rendom Id starting with R241105-3784363476374634", // first one is date,
 debit: 0,
 credit: 0,
 balance: 988384,
 PaxName: "",
 InvoiceNo:	"",
 ReferenceNo: "",
 userId: "8736434",
 addedBy: "",
}

import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';
import User from './usersTable';

interface LedgerType {
 id?: string;
 type: "Refund" | "Receipt";
 TxReferenceId: string;
 debit: number;
 credit: number;
 balance: number;
 PaxName: string;
 InvoiceNo:	string;
 ReferenceNo: number;
 addedBy: string;
 createdAt?: Date;
 userId: string;
};

class Ledgers extends Model<LedgerType> { 
 declare id: string;
 declare type: "Refund" | "Receipt";
 declare TxReferenceId: string;
 declare debit: number;
 declare credit: number;
 declare balance: number;
 declare PaxName: string;
 declare InvoiceNo:	string;
 declare ReferenceNo: number;
 declare addedBy: string;
 declare createdAt: Date;

 declare userId: string;
};

Ledgers.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  type: {
    type: DataTypes.ENUM("Refund", "Receipt"),
    allowNull: false,
  },
  TxReferenceId: {
    type: DataTypes.STRING,
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
  ReferenceNo: {
    type: DataTypes.INTEGER,
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
},{
  sequelize,
  tableName: 'ledgers',
  timestamps: true,
  updatedAt: false,
});

export default Ledgers;