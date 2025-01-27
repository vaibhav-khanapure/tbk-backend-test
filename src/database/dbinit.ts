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
import Payments from "./tables/paymentsTable";
import UserBankDetails from "./tables/userBankDetailsTable";
import ApiTransactions from "./tables/apiTransactionsTable";
import NonLCCBookings from "./tables/nonLCCBookingsTable";
import Discounts from "./tables/discountsTable";

const initDB = async () => {
 try {
  await sequelize.authenticate();
  await sequelize.sync();
  await AirportList.sync(); // Don't alter or drop AirportList table
  await Users.sync();
  await FlightBookings.sync();
  await CancelledFlights.sync();
  await UserFareInfo.sync();
  await Invoices.sync();
  await Ledgers.sync();
  await ApiTransactions.sync();
  await Discounts.sync();
  await NonLCCBookings.sync();
  await Payments.sync();
  await Settings.sync();
//   await SavedTravellers.sync({force: true});
  await UserBankDetails.sync();
  await UnsuccessfulFlights.sync();
  //   await SearchFlights.sync();

  console.log('DATABASE CONNECTED SUCCESSFULLY');
 } catch(error: any) {
  console.error('DATABASE ERROR', error?.message);
 };
};

export default initDB;