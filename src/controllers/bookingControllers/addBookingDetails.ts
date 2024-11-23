import type {Request, Response, NextFunction} from "express";
import BookingDetails from "../../database/tables/bookingDetailsTable";

function generateRandomNumber() {
 const min = 11000;
 const max = 19000;
 return Math.floor(Math.random() * (max - min + 1)) + min;
};

const addBookingDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {user} = res.locals;
  const userId = user?.id;

  const bookingDetails = req.body;

  if(!Object.keys(bookingDetails).length) {
   return res.status(400).json({ message: 'Expected Some booking details not empty object' });
  };

  const num = String(generateRandomNumber());

  const bookings = await BookingDetails?.findAll({limit: 1, order: [['createdAt', 'DESC']]});

  let newData = {} as Record<string, unknown>;

  if(!bookings?.length) {
   newData.InvoiceAmount = bookingDetails?.totalAmount;
   newData.InvoiceNo = `tbk/1`;
   newData.InvoiceId = 1;
   newData.bookedDate = new Date();
  };

  if(bookings?.length) {
   const booking = bookings?.[0];

   const invoiceNo = Number(booking?.InvoiceNo.split("/")[1]) + 1;
   const invoiceId = Number(booking?.InvoiceId) + 1;
   
  };

  const data = {
   bookingId: String(bookingDetails?.BookingId),
   TraceId: bookingDetails?.TraceId,
   PNR: bookingDetails?.PNR,
   totalAmount: String(bookingDetails?.totalAmount),
   flightStatus: bookingDetails?.FlightItinerary?.Segments?.[0]?.FlightStatus,
   IsLCC: bookingDetails?.FlightItinerary?.IsLCC,
   Segments: bookingDetails?.FlightItinerary?.Segments,
   Passenger: bookingDetails?.FlightItinerary?.Passenger,
   userId,
   InvoiceAmount: String(bookingDetails?.FlightItinerary?.InvoiceAmount),
   bookedDate: bookingDetails?.FlightItinerary?.InvoiceCreatedOn ? new Date(bookingDetails?.FlightItinerary?.InvoiceCreatedOn) : new Date(),
   InvoiceNo: bookingDetails?.FlightItinerary?.InvoiceNo || `IW/2425/${num}`,
   InvoiceId: bookingDetails?.FlightItinerary?.Invoice ? String(bookingDetails?.FlightItinerary?.Invoice?.[0]?.InvoiceId) : String(num)
  };

  const booking = await BookingDetails.create(data);

  return res.status(201).json({data: booking, RequestedData: req.body});
 } catch (error) {
  next(error);
 };
};

export default addBookingDetails;