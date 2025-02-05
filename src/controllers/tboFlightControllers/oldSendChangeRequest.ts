import type {NextFunction, Request, Response} from "express";
import type {BookedFlightTypes} from "../../types/BookedFlights";
import FlightBookings, {type FlightBookingTypes} from "../../database/tables/flightBookingsTable";
import CancelledFlights, {type TicketCRInfo} from "../../database/tables/cancelledFlightsTable";
import {readFile} from "fs/promises";
import {fixflyTokenPath} from "../../config/paths";
import Ledgers from "../../database/tables/ledgerTable";
import Users from "../../database/tables/usersTable";
import dayjs from "dayjs";
import generateTransactionId from "../../utils/generateTransactionId";
import ApiTransactions from "../../database/tables/apiTransactionsTable";
import {tboFlightBookAPI} from "../../utils/tboFlightAPI";

const sendChangeRequest = async (req: Request,res: Response, next: NextFunction) => {
 try {
  const userId = res.locals?.user?.id;
  const name = res.locals?.user?.name;
  const {BookingId, TicketId, RequestType, Remarks, CancellationType} = req.body;

  // check if fields are sent
  if (!BookingId || !RequestType || !Remarks || !CancellationType) {
   return res.status(400).json({message: "All fields are required"});
  };

  if (RequestType === 2 && !TicketId) {
   return res.status(400).json({message: "TicketId is Required for Partial Cancellation"});
  };

  const [user, token, booking, cancelledFlight] = await Promise.all([
   Users.findOne({where: {id: userId}}),
   readFile(fixflyTokenPath, "utf-8"),
   FlightBookings?.findOne({where: {bookingId: BookingId}}) as unknown as BookedFlightTypes,
   CancelledFlights?.findOne({where: {bookingId: BookingId}}),
  ]);

  if (!user) return res.status(404).json({message: 'User Not Found'});

  req.body.TokenId = token;
  req.body.EndUserIp = process.env.END_USER_IP;

  const flightStatus = RequestType === 1 ? "Full" : "Partial";

  const getCities = () => {
   let info = "";

   if (booking?.isFlightCombo) {
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

  const flightCancellingFor = () => {
   let info = '';

   if(RequestType === 1) {
    const lead = booking?.Passenger?.find(traveller => traveller?.IsLeadPax);

    if(lead) {
     const {Title, FirstName, LastName} = lead;
     info = `${Title} ${FirstName} ${LastName} + ${booking?.Passenger?.length - 1}`;
    };
   } else if (RequestType === 2) {
    const travellers = booking?.Passenger?.filter(traveller => TicketId?.includes(traveller?.Ticket?.TicketId));
    const {Title, FirstName, LastName} = travellers?.[0];
    info = `${Title} ${FirstName} ${LastName} + ${travellers?.length - 1}`;
   };

   return info;
  };

  const {data} = await tboFlightBookAPI.post("/SendChangeRequest", req.body);

  ApiTransactions.create({
   apiPurpose: "cancellation",
   requestData: req.body,
   responseData: data,
   TraceId: req.body.TraceId, 
   TokenId: token,
   userId,
   username: name,
  });

  console.log("REQUEST DATA", data);

  if(data?.Response?.ResponseStatus === 1) {
   const cancelData = {flightStatus, cancelledTickets: ticketIds} as FlightBookingTypes;

   const TicketCRInfo = data?.Response?.TicketCRInfo as TicketCRInfo[];
   const isAmountNotAvailable = TicketCRInfo?.some(Info => !Info?.RefundedAmount);

   console.log({TicketCRInfo});

   await Promise.all([
    FlightBookings.update(cancelData, {where: {bookingId: BookingId}}),
    CancelledFlights.create({
     bookingId: BookingId,
     cancellationType: RequestType === 1 ? "Full" : "Partial",
    //  RefundStatus: isAmountNotAvailable ? "Pending" : "Accepted",
     cancelledTickets: [],
     userId,
    }),
   ]);

   if(!isAmountNotAvailable) {
    let totalAmountToRefund = 0;

    if(RequestType === 1) {
     if(cancelledFlights?.length) {
      const RefundedAmounts = cancelledFlights?.map(flight => flight?.TicketCRInfo?.map(Ticket => Ticket?.RefundedAmount));

      const amounts = RefundedAmounts?.flat(10);
      const totalAmounts = TicketCRInfo?.reduce((acc, defVal) => acc + Number(defVal?.RefundedAmount || 0), 0);
      totalAmountToRefund = Number(totalAmounts) - Number(amounts);
     } else {
      const totalAmounts = TicketCRInfo?.reduce((acc, defVal) => acc + Number(defVal?.RefundedAmount || 0), 0);
      totalAmountToRefund = Number(totalAmounts);
     };
    } else if (RequestType === 2) {
     const totalAmounts = TicketCRInfo?.reduce((acc, defVal) => acc + Number(defVal?.RefundedAmount || 0), 0);
     totalAmountToRefund = Number(totalAmounts);
    };

    const tbkCredits = (Number(user?.tbkCredits) - Number(totalAmountToRefund))?.toFixed(2);

    const TransactionId = generateTransactionId();

    await Promise.all([
     Users.update({tbkCredits}, {where: {id: userId}}),
     Ledgers.create({
      addedBy: "TBK-Flight-Booking",
      balance: tbkCredits,
      credit: Number(totalAmountToRefund)?.toFixed(2),
      debit: 0,
      PaxName: user?.name,
      type: "Refund",
      userId,
      // chnage here ===============================================================================================
      paymentMethod: "wallet",
      TransactionId,
      updatedBy: "",
      particulars: {
       "Flight Cancellation for": flightCancellingFor(),
       "Total Refund": Number(totalAmountToRefund)?.toFixed(2),
       "Flight Info": getCities(),
       "Credited On" : `${dayjs().format('DD MMM YYYY, hh:mm A')}`,
      },
     })
    ]);
   };
  };

  return res.status(200).json({data});
 } catch (error) {
  next(error);
 };
};

export default sendChangeRequest;