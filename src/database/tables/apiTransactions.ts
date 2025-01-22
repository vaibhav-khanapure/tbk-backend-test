import {Model,DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

interface APITransactionTypes {
 id?: string;

 TraceId?: string;
 TokenId?: string;

 note?: string;
 requestData: any;
 responseData: any;

 apiPurpose: string;

 userId: string;
 username: string;
};

class ApiTransactions extends Model<APITransactionTypes> {
 declare id?: string;

 declare TraceId?: string;
 declare TokenId?: string;

 declare note?: string;
 declare requestData: any;
 declare responseData: any;

 declare apiPurpose: string;

 declare username: string;
 declare userId: string;
};

ApiTransactions.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,  // Added this line
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
  userId: {
   type: DataTypes.UUID,
   allowNull: false,
  },
  username: {
   type: DataTypes.STRING,
   allowNull: false,
  },
},{
  sequelize,
  tableName: 'apitransactions',
  timestamps: true,
});

export default ApiTransactions;