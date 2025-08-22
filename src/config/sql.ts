import { Sequelize, type Options } from "sequelize";

const config: Options = {
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  port: 3306,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  dialect: "mysql",
  logging: process.env.DATABASE_LOGGING_ENABLED === "true" ? console.log : false,
  pool: {
    max: 10, // Maximum connections
    min: 2,  // Minimum connections
    acquire: 30000, // Max time (ms) to try getting a connection before throwing error
    idle: 10000, // Time (ms) a connection stays idle before being released
  },
  retry: {
    max: 3,
    match: [/ECONNRESET/],
  },
};

const sequelize = new Sequelize(config);

export default sequelize;