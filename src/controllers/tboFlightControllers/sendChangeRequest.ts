import type {NextFunction, Request, Response} from "express";
import CancelledFlights, {type cancelledTicket, type TicketCRInfo} from "../../database/tables/cancelledFlightsTable";
import FlightBookings from "../../database/tables/flightBookingsTable";
import {fixflyTokenPath} from "../../config/paths";
import Users from "../../database/tables/usersTable";
import {readFile} from "fs/promises";
import {tboFlightBookAPI} from "../../utils/tboFlightAPI";
import ApiTransactions from "../../database/tables/apiTransactionsTable";

interface RequestBody {
 BookingId: number;
 TicketId: number[];
 RequestType: 1 | 2;
 Remarks: string;
 CancellationType: number;
};

const sendChangeRequest = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res.locals?.user?.id;
  const username = res.locals?.user?.name || "";

  if (!userId) return res.status(400).json({message: "Unauthorized"});

  const {BookingId, TicketId, RequestType, Remarks, CancellationType} = req.body as RequestBody;

  // check if fields are sent
  if (!BookingId || !RequestType || !Remarks || !String(CancellationType)) {
   return res.status(400).json({message: "All fields are required"});
  };

  if (RequestType === 2 && (!TicketId || !Array.isArray(TicketId))) {
   return res.status(400).json({message: "TicketId is Required for Partial Cancellation"});
  };

  const [user, token, cancelledFlight, booking] = await Promise.all([
   Users.findByPk(userId, {attributes: ["active"], raw: true}),

   readFile(fixflyTokenPath, "utf-8"),

   CancelledFlights?.findOne({
    where: {bookingId: BookingId},
    raw: true,
    attributes: ["cancellationType", "cancelledTickets"]
   }),

   FlightBookings?.findOne({
    where: {bookingId: BookingId},
    raw: true,
    attributes: ["cancelledTickets", "TraceId", "Passenger"]
   }),
  ]);

  if (!user) return res.status(404).json({message: 'User Not Found'});

  if (!booking) return res.status(404).json({message: 'Booking Not Found'});

  if (cancelledFlight && cancelledFlight?.cancellationType === "Full") {
   return res.status(400).json({message: 'Cancellation Request Already Sent'});
  };

  req.body.TokenId = token;
  req.body.EndUserIp = process.env.END_USER_IP;

  const {data} = await tboFlightBookAPI.post("/SendChangeRequest", req.body);

  if (data?.Response?.ResponseStatus === 1) {
   const TicketCRInfo = data?.Response?.TicketCRInfo as TicketCRInfo[];
   const flightStatus = RequestType === 1 ? "Cancelled" : "Partial";

   let cancelledTickets = [] as number[];

   if (RequestType === 1) {
    cancelledTickets = booking?.Passenger?.map(passenger => passenger?.Ticket?.TicketId);
   };

   if (RequestType === 2) {
    if (booking?.cancelledTickets && Array?.isArray(booking?.cancelledTickets)) {
     cancelledTickets = booking?.cancelledTickets;
    };

    TicketId?.forEach(Ticket => {
     if (!cancelledTickets.includes(Ticket)) cancelledTickets.push(Ticket);
    });
   };

   const updateOrCreateCancelledFlights = async () => {
    if (cancelledFlight) {
     const newCancelledTickets = [] as CancelledFlights["cancelledTickets"];

     TicketCRInfo?.filter(Boolean)?.forEach(Ticket => {
      const index = cancelledFlight?.cancelledTickets?.findIndex(ticket => String(ticket?.TicketId) === String(Ticket?.TicketId));

      if (index > -1) {
       if (cancelledFlight?.cancelledTickets?.[index]?.RefundStatus === "Pending") {
        cancelledFlight.cancelledTickets[index].TicketCRInfo = Ticket;
       };
      } else {
       newCancelledTickets.push({
        RefundedAmount: "",
        RefundedDate: "",
        RefundCreditedOn: "",
        RefundProcessedOn: "",
        RefundStatus: "Pending",
        TicketId: Ticket?.TicketId,
        TicketCRInfo: Ticket,
        RequestedDate: new Date(),
       });
      };
     });

     let updatedCancelledTickets = [...newCancelledTickets];

     if (cancelledFlight?.cancelledTickets && Array?.isArray(cancelledFlight?.cancelledTickets)) {
      updatedCancelledTickets = [...updatedCancelledTickets, ...cancelledFlight?.cancelledTickets];
     };

     await CancelledFlights.update(
      {
       cancellationType: RequestType === 1 ? "Full" : "Partial",
       cancelledTickets: updatedCancelledTickets,
      },
      {where: {bookingId: BookingId}}
     );
    } else {
     const TicketInfo = TicketCRInfo?.filter(Boolean)?.map(Ticket => ({
      RefundedAmount: "",
      RefundedDate: "",
      RefundCreditedOn: "",
      RefundProcessedOn: "",
      RefundStatus: "Pending",
      TicketId: Ticket?.TicketId,
      TicketCRInfo: Ticket,
      RequestedDate: new Date(),
     } as cancelledTicket));

     await CancelledFlights.create({
      bookingId: BookingId,
      cancellationType: RequestType === 1 ? "Full" : "Partial",
      userId,
      cancelledTickets: TicketInfo
     });
    };
   };

   await Promise.all([
    FlightBookings.update({flightStatus, cancelledTickets}, {where: {bookingId: BookingId}}),
    updateOrCreateCancelledFlights(),
    ApiTransactions.create({
     apiPurpose: "cancellation",
     requestData: req.body,
     responseData: data,
     type: 'flight',
     TraceId: booking?.TraceId,
     TokenId: token,
     username,
     userId,
    }, {raw: true}),
   ]);
  };

  return res.status(200).json({success: true});
 } catch (error) {
  next(error); 
 };
};

export default sendChangeRequest;