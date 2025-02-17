import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

interface InvoiceTypes {
  id?: string;
  userId: number;

  InvoiceId: number;
  InvoiceNo: string;
  tbkAmount?: number | string;
  tboAmount?: number | string;

  created_at?: string;
  updated_at?: string;
};

class Invoices extends Model<InvoiceTypes> {
 declare id?: string;
 declare userId: number;

 declare InvoiceId: number;
 declare InvoiceNo: string;
 declare tbkAmount: number | string;
 declare tboAmount: number | string;

 declare created_at?: string;
 declare updated_at?: string;
};

Invoices.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  InvoiceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  InvoiceNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tbkAmount: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: true,
  },
  tboAmount: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'invoices',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Invoices;