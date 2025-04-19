import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';
import Users from './usersTable';

interface RecentViewedHotelTypes {
  id?: string;
  userId: number;
  imgUrl: string;
  hotelName: string;
  starRatings: number;
  hotelId: string;
  reviewCount: number;

  created_at?: string;
  updated_at?: string;
}

class RecentlyViewedHotels extends Model<RecentViewedHotelTypes> {
  declare id?: string;
  declare userId: number;
  declare imgUrl: string;
  declare hotelName: string;
  declare starRatings: number;
  declare hotelId: string;
  declare reviewCount: number;

  declare created_at?: string;
  declare updated_at?: string;
}

RecentlyViewedHotels.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    imgUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hotelName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    starRatings: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    hotelId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Users,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'recently_viewed_hotels',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

RecentlyViewedHotels.belongsTo(Users, {
  foreignKey: 'userId',
  as: 'users',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

export default RecentlyViewedHotels;