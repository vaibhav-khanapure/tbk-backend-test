import sequelize from "../config/sql";
import AirportList from "./tables/airportListTable";
import BookingDetails from "./tables/bookingDetailsTable";
import CancelledFlights from "./tables/cancelledFlightsTable";
import SearchFlights from "./tables/searchFlightsTable";
import Settings from "./tables/settingsTable";
import TravellerDetails from "./tables/travellerDetailsTable";
import UnsuccessfullFlights from "./tables/unsuccessFullFlightsTable";
import Users from "./tables/usersTable";

async function initDB() {
 try {
  await sequelize.authenticate();
  await sequelize.sync();
  await Users.sync();
  await BookingDetails.sync();
  await CancelledFlights.sync();
  await SearchFlights.sync();
  await AirportList.sync();
  await Settings.sync();
  await TravellerDetails.sync();
  await UnsuccessfullFlights.sync();
  console.log('Connection has been established successfully.');
 } catch(error: any) {
  console.error('Unable to connect to the database:',error?.message);
 };
};

export default initDB;