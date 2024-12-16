import type {NextFunction, Request, Response} from "express";
import type {BookedFlightTypes} from "../../types/BookedFlights";
import FlightBookings, {type FlightBookingTypes} from "../../database/tables/flightBookingsTable";
import CancelledFlights from "../../database/tables/cancelledFlightsTable";
import sequelize from "../../config/sql";
import {readFile} from "fs/promises";
import {fixflyTokenPath} from "../../config/paths";
import tboFlightAPI from "../../utils/tboFlightAPI";
import Ledgers from "../../database/tables/ledgerTable";
import Users from "../../database/tables/usersTable";
import dayjs from "dayjs";

const sendChangeRequest = async (req: Request,res: Response, next: NextFunction) => {
 const {BookingId, TicketId, RequestType, Remarks, CancellationType} = req.body;

 if(!BookingId || !RequestType || !Remarks || !CancellationType) {
  return res.status(400).json({message: "All fields are required"});
 };

 if(RequestType !== 1 && !TicketId) return res.status(400).json({message: "TicketId is Required"});

 const {id: userId} = res.locals?.user;
 const transaction = await sequelize.transaction();

 try {
  const user = await Users.findOne({where: {id: userId}});
  if (!user) return res.status(404).json({message: 'User not found'});

  const token = await readFile(fixflyTokenPath, "utf-8");
  req.body.TokenId = token;
  req.body.EndUserIp = process.env.END_USER_IP;

  const status = RequestType === 1 ? "Cancelled" : "Partial";

  const booking = await FlightBookings?.findOne({where: {bookingId: BookingId}}) as unknown as BookedFlightTypes;
  let ticketIds = [] as number[];

  if(status === "Partial") {
   if(TicketId) ticketIds = TicketId;
   if(booking?.flightStatus === "Partial") ticketIds = [...ticketIds, ...booking?.cancelledTickets];
  };

  const {data} = await tboFlightAPI.post("/SendChangeRequest", req.body);

  console.log("TBO RESPONSE", data);

  if(data?.Response?.ResponseStatus === 1) {
   const cancelData = {
    flightStatus: status,
    cancelledTickets: ticketIds,
   } as FlightBookingTypes;

   await FlightBookings.update(cancelData, {where: {bookingId: BookingId}, transaction});

   const getCities = () => {
    let info = "";

    if(booking?.isFlightCombo) {
     const {origin, destination} = booking?.flightCities;   
     info = `${origin}→${destination}→${origin}`;
    } else {
     const segments = booking?.Segments;
     const origin = segments?.[0]?.Origin?.Airport?.CityName;
     const dest = segments?.[segments?.length - 1]?.Destination?.Airport?.CityName;
     info = `${origin}→${dest}`;
    };

    return info;
   };

   const flightCancelltingFor = () => {
    let info = '';

    if(RequestType === 1) {
     const lead = booking?.Passenger?.find(traveller => traveller?.IsLeadPax);
     
     if(lead) {
      const {Title, FirstName, LastName} = lead;
      info = `${Title} ${FirstName} ${LastName} + ${booking?.Passenger?.length - 1}`;
     };
    } else if (RequestType === 2) {
     const travellers = booking?.Passenger?.filter(traveller => ticketIds?.includes(traveller?.Ticket?.TicketId));
     const {Title, FirstName, LastName} = travellers?.[0];
     info = `${Title} ${FirstName} ${LastName} + ${travellers?.length - 1}`;
    };

    return info;
   };

   await Ledgers.create({
    addedBy: "TBK-Flight-Booking",
    balance: Number(user?.tbkCredits) - 0,
    credit: 22,
    debit: 0,
    PaxName: user?.name,
    type: "Refund",
    userId,
    particulars: {
     "Flight Cancellation for": flightCancelltingFor(),
     "Flight Info": getCities(),
     "Credited On" : `${dayjs().format('DD MMM YYYY, hh:mm A')}`,
    }
   }, {transaction});

   await CancelledFlights.create({
    bookingAmount: booking?.tbkAmount,
    bookingId: booking?.bookingId,
    RefundStatus: "Accepted",
    cancellationDate: new Date(),
    TraceId: data?.Response?.TraceId,
    cancellationType: RequestType === 1 ? "Full" : "Partial",
    TicketCRInfo: data?.Response?.TicketCRInfo,
    userId,
   }, {transaction});
  };

  await transaction.commit();
  return res.status(200).json({data});
 } catch (error) {
  await transaction.rollback();
  next(error);
 };
};

export default sendChangeRequest;