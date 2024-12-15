import type {NextFunction, Request, Response} from "express";
import type { BookedFlightTypes } from "../../types/BookedFlights";
import FlightBookings from "../../database/tables/flightBookingsTable";
import CancelledFlights from "../../database/tables/cancelledFlightsTable";
import sequelize from "../../config/sql";
import { readFile } from "fs/promises";
import { fixflyTokenPath } from "../../config/paths";
import tboFlightAPI from "../../utils/tboFlightAPI";

const sendChangeRequest = async (req: Request,res: Response, next: NextFunction) => {
 const {BookingId, TicketId, RequestType, Remarks, CancellationType} = req.body;

 if(!BookingId || !RequestType || !Remarks || !CancellationType) {
  return res.status(400).json({message: "All fields are required"});
 };

 if(RequestType !== 1 && !TicketId) return res.status(400).json({message: "TicketId is Required"});

 const {id: userId} = res.locals?.user;
 const transaction = await sequelize.transaction();

 try {
  const token = await readFile(fixflyTokenPath, "utf-8");
  req.body.TokenId = token;
  req.body.EndUserIp = process.env.END_USER_IP;

  const status = RequestType === 1 ? "Cancelled" : "Partial";
  let cancelledPassengers = [] as number[];

  const booking = await FlightBookings?.findOne({where: {bookingId: BookingId}}) as unknown as BookedFlightTypes;

  if(status === "Partial") {
   let ticketIds = [] as number[];
   if(TicketId) ticketIds = TicketId;

   cancelledPassengers = booking?.Passenger?.
    filter((passenger) => ticketIds?.includes(passenger?.Ticket?.TicketId))
   .map(({Ticket: {TicketId}}) => TicketId);
  };

  const {data} = await tboFlightAPI.post("/SendChangeRequest", req.body);

  console.log("TBO RESPONSE", data);

  if(data?.Response?.ResponseStatus === 1) {
   const cancelData = {
    flightStatus: RequestType === 1 ? "Cancelled" : "Partial",
    ...(status === "Partial" ? {cancelledPassengers} : {})
   } as {};

   await FlightBookings.update(cancelData, {where: {bookingId: BookingId}, transaction});

   await CancelledFlights.create({
    bookingAmount: booking?.tbkAmount,
    bookingId: booking?.bookingId,
    cancellationDate: new Date(),
    TraceId: data?.Response?.TraceId,
    cancellationType: RequestType === 1 ? "Full" : "Partial",
    TicketCRInfo: data?.Response?.TicketCRInfo,

    userId,
   }, { transaction });
  };

  await transaction.commit();
  return res.status(200).json({data});
 } catch (error) {
  await transaction.rollback();
  next(error);
 };
};

export default sendChangeRequest;