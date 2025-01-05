import "dotenv/config";
import {Sequelize, type Options} from "sequelize";

const {DATABASE_HOST, DATABASE_USERNAME, DATABASE_NAME, DATABASE_PASSWORD} = process.env;

const local: Options = {
 host: "localhost",
 username: "root",
 database: "tbk",
 dialect: "mysql",
 logging: console.log,
};

const prod: Options = {
 host: DATABASE_HOST,
 username: DATABASE_USERNAME,
 database: DATABASE_NAME,
 password: DATABASE_PASSWORD,
 dialect: "mysql",
 logging: process.env.NODE_ENV === "development" ? console.log : false,
};

const sequelize = new Sequelize(prod);

export default sequelize;