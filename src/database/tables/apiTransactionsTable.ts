import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';

interface APITransactionTypes {
  id?: number;
  userId: number;

  TraceId?: string;
  TokenId?: string;

  note?: string;
  requestData: any;
  responseData: any;
  apiPurpose: string;
  username: string;

  created_at?: Date;
  updated_at?: Date;
};

class ApiTransactions extends Model<APITransactionTypes> {
  declare id?: number;
  declare userId: number;

  declare TraceId?: string;
  declare TokenId?: string;

  declare note?: string;
  declare requestData: any;
  declare responseData: any;
  declare apiPurpose: string;
  declare username: string;

  declare created_at?: Date;
  declare updated_at?: Date;
};

ApiTransactions.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  apiPurpose: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  TraceId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  TokenId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  note: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  requestData: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  responseData: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'apitransactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default ApiTransactions;