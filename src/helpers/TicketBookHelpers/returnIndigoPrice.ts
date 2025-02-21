import dayjs from "dayjs";
import Ledgers from "../../database/tables/ledgerTable";
import Users from "../../database/tables/usersTable";
import type {FlightSeatType, Segment} from "../../types/BookedFlights";
import {calculateSeatsTotalPrice} from "../../utils/calculateSSRAmounts";
import generateTransactionId from "../../utils/generateTransactionId";

interface Args {
 userId: number;
 passengerSeats: FlightSeatType[];
 bookedSeats: FlightSeatType[];
 Segments: Segment[];
};

const returnIndigoPrice = async (Args: Args) => {
 try {
  const {userId, passengerSeats, bookedSeats, Segments} = Args;

  if (!userId || !Array.isArray(passengerSeats) || !Array.isArray(bookedSeats) || !Array.isArray(Segments)) {
   return {error: "Please provide all the fields"}; 
  };

  const segments = Segments?.flat(10);
  let isIndigo = false;

  for (const segment of segments) {
   if (segment?.Airline?.AirlineCode === "6E") {
    isIndigo = true;
    break;
   };
  };

  if (!isIndigo) return {success: true};

  const passengerSeatsPrice = calculateSeatsTotalPrice(passengerSeats?.flat(10));
  const bookedSeatsPrice = calculateSeatsTotalPrice(bookedSeats?.flat(10));

  if (bookedSeatsPrice === passengerSeatsPrice) return {success: true};

  if (bookedSeatsPrice > passengerSeatsPrice) {
   const user = await Users.findByPk(userId, { attributes: ["tbkCredits", "name"], raw: true });
   if (!user) return {error: "User not found"};

   const credit = bookedSeatsPrice - passengerSeatsPrice;

   const tbkCredits = Number(Number(user?.tbkCredits) + credit)?.toFixed(2);
   const TransactionId = generateTransactionId();

   await Users.update({tbkCredits}, {where: {id: userId}});
   await Ledgers.create({
    addedByUserId: userId,
    balance: tbkCredits,
    credit: credit?.toFixed(2),
    debit: 0,
    PaxName: user?.name,
    paymentMethod: "wallet",
    reason: "Indigo Flight Seats booked differently",
    TransactionId,
    userId,
    type: "Refund",
    particulars: {
     "Amount Credited": credit?.toFixed(2),
     "Credited Date": dayjs()?.toISOString(),
    }
   });

   return {success: true};
  };

  return {success: true};
 } catch (error) {
  return {error: "Some Error Occurred"};
 };
};

export default returnIndigoPrice;