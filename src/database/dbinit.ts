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
import RecentlyViewedHotels from "./tables/recentlyViewedHotelsTable";
import HotelBookings from "./tables/hotelBookingsTable";
import UnsuccessfulHotels from "./tables/unsuccessfulHotelsTable";
import CancelledHotels from "./tables/cancelledHotelsTable";
import HotelDiscounts from "./tables/hotelDiscountsTable";
import HotelGroups from "./tables/hotelGroupsTable";
import HotelPrices from "./tables/hotelPricesTable";
import Headlines from "./tables/headlinesTable";

const initDB = async () => {
 try {
  await sequelize.authenticate();
  await sequelize.sync();
  await AirportList.sync(); // Don't alter or drop AirportList table
  await ApiTransactions.sync();
  await CancelledFlights.sync();
  await CancelledHotels.sync();
  await Discounts.sync({alter: true});
  await FareQuotes.sync();
  await FlightBookings.sync({alter: true});
  await Groups.sync();
  await Headlines.sync({alter: true});
  await HotelBookings.sync({alter: true});
  await HotelDiscounts.sync({alter: true});
  await HotelGroups.sync();
  await HotelPrices.sync();
  await Invoices.sync();
  await Ledgers.sync();
  await NonLCCBookings.sync();
  await Payments.sync();
  await RecentlyViewedHotels.sync();
  await SavedTravellers.sync();
  await Settings.sync();
  await UnsuccessfulFlights.sync();
  await UnsuccessfulHotels.sync();
  await UserBankDetails.sync();
  await Users.sync({alter: true});

  console.log('DATABASE CONNECTED SUCCESSFULLY');
 } catch(error: any) {
  console.error('DATABASE ERROR', error?.message);
 };
};

export default initDB;