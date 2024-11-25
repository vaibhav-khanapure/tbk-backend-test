import type {Request, Response, NextFunction} from "express";
import BookingDetails, { BookingDetailsTypes } from "../../database/tables/bookingDetailsTable";

const addBookingDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {user} = res.locals;
  const userId = user?.id;

  const details = req.body;

  if(!Array.isArray(details)) {
   return res.status(400).json({ message: 'Expected Some booking details not empty array' });
  };

  let invoiceNo: string | number = "";

  const lastBooking = await BookingDetails?.findAll({limit: 1, order: [['createdAt', 'DESC']]});

  if(!lastBooking?.length) {
   invoiceNo  = "ID/2425/1"; 
  } else {
   const invoice = lastBooking?.[0];
   invoiceNo = invoice?.dataValues?.InvoiceNo?.split("/")?.[2] as unknown as string;
  };

  const bookings = details?.map((booking: BookingDetailsTypes, index) => ({
   bookingId: booking?.bookingId,
   TraceId: booking?.TraceId,
   PNR: booking?.PNR,
   tboAmount: booking?.tboAmount,
   tbkAmount: booking?.tbkAmount,
   bookedDate: booking?.bookedDate || new Date(),
   InvoiceNo: !lastBooking?.length ? invoiceNo : `ID/2425/${Number(invoiceNo) + 1}`, //(index + 1)}`,
   InvoiceId: !lastBooking?.length ? 1 : Number(lastBooking?.[0]?.InvoiceId) + 1, //(index + 1),
   Passenger: booking?.Passenger,
   Segments: booking?.Segments,
   IsLCC: booking?.IsLCC,
   flightStatus: booking?.flightStatus,
   userId,
  })) as BookingDetailsTypes[];

  const booking = await BookingDetails?.bulkCreate(bookings);

  return res.status(201).json({data: booking, RequestedData: req.body});
 } catch (error) {
  next(error);
 };
};

export default addBookingDetails;