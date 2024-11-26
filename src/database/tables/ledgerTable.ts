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

interface Ledger {
 
};