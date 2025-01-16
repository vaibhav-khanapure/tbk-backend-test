import "dotenv/config";
import {Sequelize, type Options} from "sequelize";

const {DATABASE_HOST, DATABASE_USERNAME, DATABASE_NAME, DATABASE_PASSWORD, DATABASE_LOGGING_ENABLED} = process.env;

const config: Options = {
 host: DATABASE_HOST,
 username: DATABASE_USERNAME,
 database: DATABASE_NAME,
 password: DATABASE_PASSWORD,
 dialect: "mysql",
 logging: DATABASE_LOGGING_ENABLED ? false : false,
};

const sequelize = new Sequelize(config);

export default sequelize;