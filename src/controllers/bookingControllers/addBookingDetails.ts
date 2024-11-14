import type {Request, Response, NextFunction} from "express";
import BookingDetails from "../../database/tables/bookingDetailsTable";

const addBookingDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {user} = res.locals;
  const userId = user?.id;

  const bookingDetails = req.body;

  if(Object.keys(bookingDetails).length === 0) {
   return res.status(400).json({ message: 'Expected Some booking details not empty object' });
  };

  const booking = await BookingDetails.create({
   bookingId: String(bookingDetails?.BookingId),
   TraceId: bookingDetails?.TraceId,
   PNR: bookingDetails?.PNR,
   totalAmount: String(bookingDetails?.totalAmount),
   InvoiceAmount: String(bookingDetails?.FlightItinerary?.InvoiceAmount),
   bookedDate: new Date(bookingDetails?.FlightItinerary.InvoiceCreatedOn),
   flightStatus: bookingDetails?.FlightItinerary?.Segments[0]?.FlightStatus,
   InvoiceNo: bookingDetails?.FlightItinerary?.InvoiceNo,
   InvoiceId: String(bookingDetails?.FlightItinerary?.Invoice[0].InvoiceId),
   IsLCC: bookingDetails?.FlightItinerary.IsLCC,
   Segments: bookingDetails?.FlightItinerary.Segments,
   Passenger: bookingDetails?.FlightItinerary.Passenger,
   userId,
  });

  return res.status(201).json({data: booking});
 } catch (error) {
  next(error);
 };
};

export default addBookingDetails;