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
import Groups from "./tables/groupsTable";
import RecentlyViewedHotels from "./tables/recentlyViewedHotels";
import HotelBookings from "./tables/hotelBookings";

const initDB = async () => {
 try {
  await sequelize.authenticate();
  await sequelize.sync();
  await AirportList.sync(); // Don't alter or drop AirportList table
  await ApiTransactions.sync();
  await CancelledFlights.sync();
  await Discounts.sync();
  await FareQuotes.sync();
  await FlightBookings.sync();
  await Groups.sync();
  await HotelBookings.sync();
  await Invoices.sync();
  await Ledgers.sync();
  await NonLCCBookings.sync();
  await Payments.sync();
  await RecentlyViewedHotels.sync();
  await SavedTravellers.sync();
  await Settings.sync();
  await UnsuccessfulFlights.sync();
  await UserBankDetails.sync();
  await Users.sync();

  console.log('DATABASE CONNECTED SUCCESSFULLY');
 } catch(error: any) {
  console.error('DATABASE ERROR', error?.message);
 };
};

export default initDB;