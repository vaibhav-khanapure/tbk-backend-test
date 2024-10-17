import type {Request, Response, NextFunction} from "express";
import BookingDetails from "../../database/tables/bookingDetailsTable";

const addBookingDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {user} = res.locals;
  const userId = user?.id;

  const bookingDetails = req.body.data;
  const totalAmount = req.body.totalAmount;

  if(Object.keys(bookingDetails).length === 0) {
   return res.status(400).json({ message: 'Expected Some booking details not empty object' });
  };

  const booking = await BookingDetails.create({
   bookingId: JSON.stringify(bookingDetails?.Response.BookingId),
   TraceId: bookingDetails.TraceId,
   PNR: bookingDetails?.Response.PNR,
   totalAmount: JSON.stringify(totalAmount),
   InvoiceAmount: JSON.stringify(bookingDetails.Response.FlightItinerary?.InvoiceAmount),
   bookedDate: new Date(bookingDetails.Response.FlightItinerary.InvoiceCreatedOn),
   flightStatus: bookingDetails?.Response?.FlightItinerary?.Segments[0]?.FlightStatus,
   InvoiceNo: bookingDetails.Response.FlightItinerary?.InvoiceNo,
   InvoiceId: JSON.stringify(bookingDetails.Response.FlightItinerary?.Invoice[0].InvoiceId),
   IsLCC: bookingDetails.Response.FlightItinerary.IsLCC,
   Segments: bookingDetails.Response.FlightItinerary.Segments,
   Passenger: bookingDetails.Response.FlightItinerary.Passenger,
   userId
  });
  
  return res.status(201).json({data: booking});
 } catch (error) {
  next(error);
 };
};

export default addBookingDetails;