import type {NextFunction, Request, Response} from "express";
import FlightBookings from "../../database/tables/flightBookingsTable";
import HotelBookings from "../../database/tables/hotelBookingsTable";

const getBookedFlightDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res.locals?.user?.id;
  if (!userId) return res.status(401).json({message: "Unauthorized"});

  const [results, hotels] = await Promise.all([
   FlightBookings?.findAll({
    where: {userId},
    raw: true,
    attributes: {
     exclude: ["id", "TraceId", "InvoiceId", "created_at", "updated_at", "discount", "markup", "userId", "fareType", "discountUpdatedByStaffId", "tboPassenger", "tboAmount", "tbkAmount", "PNR"]
    }
   }),
   HotelBookings.findAll({
    where: {userId},
    raw: true,
    attributes: ["bookingCode", "bookingData", "bookingStatus"]
   }),
  ]);

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

  return res.status(200).json({flights, hotels});
 } catch (error) {
  next(error);
 };
};

export default getBookedFlightDetails;