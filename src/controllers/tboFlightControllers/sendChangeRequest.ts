import type {NextFunction, Request, Response} from "express";
import type { BookedFlightTypes } from "../../types/BookedFlights";
import BookingDetails from "../../database/tables/bookingDetailsTable";
import CancelledFlights from "../../database/tables/cancelledFlightsTable";
import sequelize from "../../config/sql";
import { readFile } from "fs/promises";
import { fixflyTokenPath } from "../../config/paths";
import tboFlightAPI from "../../utils/tboFlightAPI";

const sendChangeRequest = async (req: Request,res: Response, next: NextFunction) => {
 const transaction = await sequelize.transaction();

 try {
  const token = await readFile(fixflyTokenPath, "utf-8");
  req.body.TokenId = token;
  req.body.EndUserIp = process.env.EndUserIp;

  const status = req.body.RequestType === 1 ? "Cancelled" : "Partial";
  let cancelledPassengers = [] as object[];

  if(status === "Partial") {
   const booking = await BookingDetails?.findOne({where: {bookingId: req.body.BookingId}}) as unknown as BookedFlightTypes;
   let ticketIds = [] as number[];
   if(req.body.TicketId) ticketIds = req.body.TicketId;

   cancelledPassengers = booking?.Passenger?.
   filter((passenger) => ticketIds?.includes(passenger?.Ticket?.TicketId))
   .map(({PaxType, FirstName, LastName}) => ({PaxType, FirstName, LastName}));
  };

  const {user} = res.locals;
  const userId = user?.id;

  const {data} = await tboFlightAPI.post("/SendChangeRequest", req.body);

  if(data?.Response?.ResponseStatus === 1) {
   const info = data?.Response?.TicketCRInfo?.[0];

   const cancelData = {
    ...(status === "Partial" ? {
     flightStatus: req.body.RequestType === 1 ? "Cancelled" : "Partial",
     cancelledPassengers,
    } : {}
    ) 
   } as {};

   await BookingDetails.update(
    { changeRequestId: info?.ChangeRequestId, ...cancelData},
    { where: { bookingId: req.body.BookingId }, transaction }
   );

   await CancelledFlights.create({
     ChangeRequestId: info?.ChangeRequestId as string,
     TicketId: info?.TicketId,
     cancellationDate: new Date(),
     cancellationType: "Full",
     cancellationCharge: info?.CancellationCharge,
     Status: info?.Status,
     Remarks: info?.Remarks,
     ChangeRequestStatus: info?.Status,
     RefundedAmount: info?.RefundedAmount,
     ServiceTaxOnRAF: info?.ServiceTaxOnRAF || 0,
     SwachhBharatCess: info?.SwachhBharatCess || 0,
     KrishiKalyanCess: info?.KrishiKalyanCess || 0,
     CreditNoteNo: info?.CreditNoteNo,
     CreditNoteCreatedOn: new Date(info?.CreditNoteCreatedOn || new Date()),
     TraceId: data?.Response?.TraceId,
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