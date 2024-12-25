import sequelize from "../config/sql";
import AirportList from "./tables/airportListTable";
import FlightBookings from "./tables/flightBookingsTable";
import CancelledFlights from "./tables/cancelledFlightsTable";
import Invoices from "./tables/invoicesTable";
import Ledgers from "./tables/ledgerTable";
import SearchFlights from "./tables/searchFlightsTable";
import Settings from "./tables/settingsTable";
import SavedTravellers from "./tables/savedTravellersTable";
import UnsuccessfulFlights from "./tables/unsuccessfulFlightsTable";
import UserFareInfo from "./tables/userFareInfoTable";
import Users from "./tables/usersTable";

const initDB = async () => {
 try {
  await sequelize.authenticate();
  await sequelize.sync();
  await AirportList.sync(); // Don't alter or drop AirportList table
  await Users.sync({alter: true});
  await FlightBookings.sync({alter: true});
  await CancelledFlights.sync({alter: true});
  await UserFareInfo.sync({alter: true});
  await Invoices.sync({alter: true});
  await Ledgers.sync({alter: true});
  
//   await SearchFlights.sync();
  await Settings.sync({alter: true});
  await SavedTravellers.sync({alter: true});
  await UnsuccessfulFlights.sync({alter: true});
  console.log('Connection has been established successfully.');
 } catch(error: any) {
  console.error('Unable to connect to the database:',error?.message);
 };
};

export default initDB;
