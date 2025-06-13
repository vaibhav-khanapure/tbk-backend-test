import { DataTypes, Model } from "sequelize";
import sequelize from '../../config/sql';

interface hotelPrices {
    id?: number;
    traceId: string;
    userId: number;
    hotelId: number;
    oldPrice?: number;
    newPrice?: number;
};

class HotelPrices extends Model<hotelPrices> {
    declare id?: number;
    declare traceId: string;
    declare userId: number;
    declare hotelId: number;
    declare oldPrice: number;
    declare newPrice: number;
};

HotelPrices.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    traceId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    hotelId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    oldPrice: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
    },
    newPrice: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
    }
}, {
    sequelize,
    tableName: 'hotel_prices',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default HotelPrices;