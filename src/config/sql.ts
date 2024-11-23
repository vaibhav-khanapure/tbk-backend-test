import "dotenv/config";
import {Sequelize} from "sequelize";

const {DATABASE_HOST, DATABASE_USERNAME, DATABASE_NAME, DATABASE_PASSWORD} = process.env;

const sequelize = new Sequelize({
 host: DATABASE_HOST,
 username: DATABASE_USERNAME,
 database: DATABASE_NAME,
//  password: DATABASE_PASSWORD,
 dialect: "mysql",
 logging: process.env.NODE_ENV === "development" ? console.log : false,
});

export default sequelize;