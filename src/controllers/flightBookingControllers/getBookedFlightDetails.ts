import type {NextFunction, Request, Response} from "express";
import FlightBookings from "../../database/tables/flightBookingsTable";

const getBookedFlightDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res.locals?.user?.id;
  if (!userId) return res.status(400).json({message: "Unauthorized"});

  const results = await FlightBookings?.findAll({
   where: {userId},
   raw: true,
   attributes: {
    exclude: ["id", "TraceId", "InvoiceId", "createdAt", "updatedAt", "discount", "markup", "userId", "fareType", "discountUpdatedByStaffId", "tboPassenger", "tboAmount", "tbkAmount", "PNR", "InvoiceNo"]
   }
  });

  const flights = results?.map(flight => {
   const Flight = flight as unknown as Record<string, any>;

   Flight.Passenger = flight?.Passenger?.map(Passenger => ({
    Title: Passenger?.Title,
    TicketId: Passenger?.Ticket?.TicketId,
    FirstName: Passenger?.FirstName,
    LastName: Passenger?.LastName   
   }));

   return Flight;
  });

  return res.status(200).json({data: flights});
 } catch (error) {
  next(error);
 };
};

export default getBookedFlightDetails;