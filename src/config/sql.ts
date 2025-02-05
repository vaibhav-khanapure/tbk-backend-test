import "dotenv/config";
import {Sequelize, type Options} from "sequelize";

const {DATABASE_HOST, DATABASE_USERNAME, DATABASE_NAME, DATABASE_PASSWORD, DATABASE_LOGGING_ENABLED} = process?.env;

const config: Options = {
 host: DATABASE_HOST,
 username: DATABASE_USERNAME,
 database: DATABASE_NAME,
 password: DATABASE_PASSWORD,
 dialect: "mysql",
 logging: DATABASE_LOGGING_ENABLED ? true : false,
//  pool: {
//     max: 10, // Maximum connections
//     min: 2,  // Minimum connections
//     acquire: 30000, // Max time (ms) to try getting a connection before throwing error
//     idle: 10000, // Time (ms) a connection stays idle before being released
//   },
};

const sequelize = new Sequelize(config);

export default sequelize;