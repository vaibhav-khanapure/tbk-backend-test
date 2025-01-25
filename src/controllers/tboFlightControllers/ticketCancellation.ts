import type {NextFunction, Request, Response} from "express";
import CancelledFlights, {type cancelledTicket, type TicketCRInfo} from "../../database/tables/cancelledFlightsTable";
import type {BookedFlightTypes} from "../../types/BookedFlights";
import FlightBookings from "../../database/tables/flightBookingsTable";
import {fixflyTokenPath} from "../../config/paths";
import Users from "../../database/tables/usersTable";
import {readFile} from "fs/promises";
import {tboFlightBookAPI} from "../../utils/tboFlightAPI";
import ApiTransactions from "../../database/tables/apiTransactions";

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
  const name = res.locals?.user?.name;
  const {BookingId, TicketId, RequestType, Remarks, CancellationType} = req.body as RequestBody;

  // check if fields are sent
  if (!BookingId || !RequestType || !Remarks || !CancellationType) {
   return res.status(400).json({message: "All fields are required"});
  };

  if (RequestType === 2 && !TicketId && Array.isArray(TicketId)) {
   return res.status(400).json({message: "TicketId is Required for Partial Cancellation"});
  };

  const [user, token, booking, cancelledFlight] = await Promise.all([
   Users.findOne({where: {id: userId}, attributes: {include: ["tbkCredits"]}}),
   readFile(fixflyTokenPath, "utf-8"),
   FlightBookings?.findOne({where: {bookingId: BookingId}, attributes: {include: ["cancelledTickets"]}}) as unknown as BookedFlightTypes,
   CancelledFlights?.findOne({where: {bookingId: BookingId}}),
  ]);

  if (!user) return res.status(404).json({message: 'User Not Found'});
  if (!booking) return res.status(404).json({message: 'Booking Not Found'});
  if (cancelledFlight && cancelledFlight?.cancellationType === "Full") {
   return res.status(400).json({message: 'Cancellation Request Already Sent'});
  };

  req.body.TokenId = token;
  req.body.EndUserIp = process.env.END_USER_IP;

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

  const getFlightCancellingFor = () => {
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

  if (data?.Response?.ResponseStatus === 1) {
   const TicketCRInfo = data?.Response?.TicketCRInfo as TicketCRInfo[];
   const flightStatus = RequestType === 1 ? "Cancelled" : "Partial";
   let cancelledTickets = [] as number[];
   const CancelledTickets = booking?.cancelledTickets && Array?.isArray(booking?.cancelledTickets);

   if (RequestType === 2) {
    cancelledTickets = CancelledTickets ? [...booking?.cancelledTickets] : [];

    TicketId?.forEach(Ticket => {
     if (!cancelledTickets.includes(Ticket)) cancelledTickets.push(Ticket);
    });
   };

   const updateOrCreateCancelledFlights = async () => {
    if (cancelledFlight) {
     const newCancelledTickets = [] as CancelledFlights["cancelledTickets"];

     TicketCRInfo?.filter(Boolean)?.forEach(Ticket => {
      const index = cancelledFlight?.cancelledTickets?.findIndex(ticket => ticket?.TicketId === Ticket?.TicketId);

      if (index > -1 && cancelledFlight?.cancelledTickets?.[index]?.RefundStatus === "Pending") {
       cancelledFlight.cancelledTickets[index].TicketCRInfo = Ticket;
      } else {
       newCancelledTickets.push({
        RefundedAmount: "",
        RefundedDate: "",
        RefundCreditedOn: "",
        RefundProcessedOn: "",
        RefundStatus: "Pending",
        TicketId: Ticket?.TicketId,
        TicketCRInfo: Ticket,
       });
      };
     });

     await cancelledFlight.update(
      {
       cancellationType: RequestType === 1 ? "Full" : "Partial",
       cancelledTickets: [...(CancelledTickets ? cancelledFlight?.cancelledTickets : []), ...newCancelledTickets],
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
   ]);
  };
 } catch (error) {
  next(error); 
 };
};

export default sendChangeRequest;