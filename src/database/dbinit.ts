import sequelize from "../config/sql";
import AirportList from "./tables/airportListTable";
import FlightBookings from "./tables/flightBookingsTable";
import CancelledFlights from "./tables/cancelledFlightsTable";
import Invoices from "./tables/invoicesTable";
import Ledgers from "./tables/ledgerTable";
import Settings from "./tables/settingsTable";
import SavedTravellers from "./tables/savedTravellersTable";
import UnsuccessfulFlights from "./tables/unsuccessfulFlightsTable";
import Users from "./tables/usersTable";
import Payments from "./tables/paymentsTable";
import UserBankDetails from "./tables/userBankDetailsTable";
import ApiTransactions from "./tables/apiTransactionsTable";
import NonLCCBookings from "./tables/nonLCCBookingsTable";
import Discounts from "./tables/discountsTable";
import FareQuotes from "./tables/fareQuotesTable";

const initDB = async () => {
 try {
  await sequelize.authenticate();
  await sequelize.sync();
  await AirportList.sync({alter: true}); // Don't alter or drop AirportList table
  await ApiTransactions.sync({alter: true});
  await CancelledFlights.sync({alter: true});
  await Discounts.sync({alter: true});
  await FareQuotes.sync({alter: true});
  await FlightBookings.sync({alter: true});
  await Invoices.sync({alter: true});
  await Ledgers.sync({alter: true});
  await NonLCCBookings.sync({alter: true});
  await Payments.sync({alter: true});
  await SavedTravellers.sync({alter: true});
  await Settings.sync({alter: true});
  await UnsuccessfulFlights.sync({alter: true});
  await UserBankDetails.sync({alter: true});
  await Users.sync({alter: true});

  console.log('DATABASE CONNECTED SUCCESSFULLY');
 } catch(error: any) {
  console.error('DATABASE ERROR', error?.message);
 };
};

export default initDB;