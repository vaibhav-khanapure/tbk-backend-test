import type {NextFunction, Request, Response} from "express";
import Users from "../../database/tables/usersTable";
import {readFile} from "fs/promises";
import {fixflyTokenPath} from "../../config/paths";
import {tboFlightBookAPI} from "../../utils/tboFlightAPI";
import Payments from "../../database/tables/paymentsTable";

const ticketBook = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const id = res.locals?.user?.id;
  const name = res.locals?.user?.name;

  const {ticketsData, isFlightCombo, TraceId, rprId} = req.body;

  if (!ticketsData || !Array.isArray(ticketsData)) {
   return res.status(400).json({message: "Ticket data is required"}); 
  };

  if (!TraceId) {
   return res.status(400).json({message: "TraceId is required"}); 
  };

  const flightType = ticketsData?.length > 1 ? "round-trip" : "one-way";

  const [token, user, payment] = await Promise.all([
   readFile(fixflyTokenPath, "utf-8"),
   Users.findOne({where: {id}}),
   ...(rprId ? [Payments.findOne({where: {RazorpayPaymentId: rprId}})] : []),
  ]);

  if (payment && payment?.isUsed) {
   return res.status(400).json({message: "Not Allowed for Booking"}); 
  };

  req.body.TokenId = token;
  req.body.EndUserIp = process.env.END_USER_IP;

  if (!user?.active || user?.disableTicket) {
   return res.status(400).json({message: "You don't have permission for booking"}); 
  };

  const tickets = ticketsData?.map(Ticket => {
   const data = {} as Record<string, unknown>;
 
   data.TraceId = TraceId;
   data.TokenId = token;
   data.EndUserIp = process.env.END_USER_IP;
   data.ResultIndex = Ticket?.ResultIndex;
   data.Passengers = Ticket?.Passengers;
   if (Ticket?.IsAllowBookingWithoutSeat) data.IsAllowBookingWithoutSeat = Ticket?.IsAllowBookingWithoutSeat;

   return data;
  });

  const results = await Promise.allSettled(tickets?.map(ticket => tboFlightBookAPI.post("/Ticket", ticket)));

  

  const [{data: originResponse}] = await Promise.all([
   tboFlightBookAPI.post("/Ticket", req.body),
  ]);
 } catch (error) {
  next(error);  
 };
};