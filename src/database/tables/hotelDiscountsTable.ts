import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/sql';

interface HotelDiscountTypes {
    id: number;

    createdBy: number;
    updatedBy: number;

    minPrice: number;
    maxPrice: number;
    coins?: number;

    discount: number;
    markup: number;

    discountValueType?: string;
    markupValueType?: string;
    coinsValueType?: string;

    hotelGroupId: number;

    created_at?: Date;
    updated_at?: Date;
};

class HotelDiscounts extends Model<HotelDiscountTypes> {
    declare id: number;

    declare createdBy: number;
    declare updatedBy: number;

    declare minPrice: number;
    declare maxPrice: number;
    declare coins?: number;

    declare discount: number;
    declare markup: number;

    declare discountValueType?: string;
    declare markupValueType?: string;
    declare coinsValueType?: string;

    declare hotelGroupId: number;

    declare created_at?: Date;
    declare updated_at?: Date;
};

HotelDiscounts.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    minPrice: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    maxPrice: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    discount: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    markup: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    coins: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    discountValueType: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    markupValueType: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    coinsValueType: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Percentage'
    },
    hotelGroupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize,
    tableName: 'hoteldiscounts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default HotelDiscounts;