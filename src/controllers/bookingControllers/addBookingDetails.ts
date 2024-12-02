import type {Request, Response, NextFunction} from "express";
import { Transaction } from 'sequelize';
import BookingDetails, { type BookingDetailsTypes } from "../../database/tables/bookingDetailsTable";
import Invoices from "../../database/tables/invoicesTable";
import Ledgers, { LedgerType } from "../../database/tables/ledgerTable";
import Users, { type userTypes } from "../../database/tables/usersTable";
import sequelize from "../../config/sql";
import dayjs from "dayjs";

const addBookingDetails = async (req: Request, res: Response, next: NextFunction) => {
 const transaction: Transaction = await sequelize.transaction();

 try {
  const {user} = res.locals;
  const userId = user?.id;

  const details = req.body;

  if(!Array.isArray(details)) {
   await transaction.rollback();
   return res.status(400).json({ message: 'Expected Some booking details not empty array' });
  };

  let invoiceNo: string | number = "";

  const invoices = await Invoices.findAll({
   limit: 1,
   order: [['createdAt', 'DESC']],
   transaction
  });

  if(!invoices?.length) {
   invoiceNo  = "ID/2425/1";
  } else {
   const invoice = invoices?.[0];
   invoiceNo = invoice?.dataValues?.InvoiceNo?.split("/")?.[2];
  };

  const InvoiceId = !invoices?.length ? 1 : Number(invoices?.[0]?.InvoiceId) + 1;
  const InvoiceNo = !invoices?.length ? invoiceNo : `ID/2425/${Number(invoiceNo) + 1}`;

  await Invoices.create({
   InvoiceId,
   InvoiceNo,
   tboAmount: details?.reduce((acc, defVal) => acc + defVal?.tboAmount, 0),
   tbkAmount: details?.reduce((acc, defVal) => acc + defVal?.tbkAmount, 0),
   userId,
  }, { transaction });

  const getUser = await Users.findOne({
   where: { id: userId },
   transaction
  }) as userTypes;

  const leadPax = details?.[0]?.Passenger?.find((traveller: Record<string, unknown>) => traveller?.IsLeadPax);
  const totalPassengers = details?.[0]?.Passenger?.length as number;

  const ledgers = details?.map((booking: BookingDetailsTypes) => {
   const segments = (booking?.Segments as any);
   const {DepTime} = segments?.[0]?.Origin;
   const {AirlineCode, FlightNumber} = segments?.[0]?.Airline;
   const {Title, FirstName, LastName} = leadPax;

   const getCities = () => {
    const route = [segments?.[0]?.Origin?.Airport?.CityName];
    segments?.forEach((segment: any) => route?.push(segment?.Destination?.Airport?.CityName));
    return route?.join(' → ');
   };

   return {
    type: "Invoice",
    addedBy: "TBK-Booking-Flight",
    debit: booking?.tbkAmount,
    credit: 0,
    balance: Number(getUser?.tbkCredits) - Number(booking?.tbkAmount),
    InvoiceNo,
    PaxName: `${Title} ${FirstName} ${LastName} ${totalPassengers > 1 ? `+ ${Number(totalPassengers) - 1}` : ""}`,
    userId,
    particulars: {
     "Ticket Created": `${Title} ${FirstName} ${LastName} ${totalPassengers > 1 ? `+ ${Number(totalPassengers) - 1}` : ""}`,
     [getCities()]: `PNR ${booking?.PNR}`,
     "Travel Date" : `${dayjs(DepTime).format('DD MMM YYYY, hh:mm A')}, By ${AirlineCode} ${FlightNumber}`,
    },
   };
  }) as LedgerType[];

  await Ledgers?.bulkCreate(ledgers, {transaction});

  const bookings = details?.map((booking: BookingDetailsTypes) => ({
    bookingId: booking?.bookingId,
    TraceId: booking?.TraceId,
    PNR: booking?.PNR,
    tboAmount: booking?.tboAmount,
    tbkAmount: booking?.tbkAmount,
    bookedDate: booking?.bookedDate || new Date(),
    InvoiceNo,
    InvoiceId,
    Passenger: booking?.Passenger,
    Segments: booking?.Segments,
    IsLCC: booking?.IsLCC,
    flightStatus: booking?.flightStatus,
    userId,
  })) as BookingDetailsTypes[];

  const booking = await BookingDetails?.bulkCreate(bookings, { transaction });

  await transaction.commit();
  return res.status(201).json({data: booking, RequestedData: req.body});
 } catch (error) {
  await transaction.rollback();
  next(error);
 }
};

export default addBookingDetails;