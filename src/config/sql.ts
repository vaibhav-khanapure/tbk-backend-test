import "dotenv/config";
import {Sequelize} from "sequelize";

const {DATABASE_HOST, DATABASE_USERNAME, DATABASE_NAME, DATABASE_PASSWORD} = process.env;

const sequelize = new Sequelize({
 host: DATABASE_HOST,
 username: DATABASE_USERNAME,
 database: DATABASE_NAME,
 password: DATABASE_PASSWORD,
 dialect: "mysql",
 dialectOptions: {
  connectTimeout: 60000, // 60 seconds
  // Add lock timeout in the MySQL query
  initializationCommands: ['SET innodb_lock_wait_timeout = 120'], // 120 seconds
 },
 pool: {
  acquire: 60000, // 60 seconds - time to acquire connection from pool
 },
 logging: process.env.NODE_ENV === "development" ? console.log : false,
});

export default sequelize;