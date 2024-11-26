import sequelize from "../config/sql";

async function runMigration() {
 try {
  await sequelize.authenticate();
  await sequelize.sync(); 
  console.log('Connection has been established successfully.');
 } catch(error: any) {
  console.error('Unable to connect to the database:',error?.message);
 };
};

export default runMigration;