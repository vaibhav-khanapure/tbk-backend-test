import type {Request, Response, NextFunction} from "express";
import Invoices from "../../database/tables/invoicesTable";
import Ledgers, {type LedgerType} from "../../database/tables/ledgerTable";
import Users from "../../database/tables/usersTable";
import dayjs from "dayjs";
import FlightBookings, {type FlightBookingTypes} from "../../database/tables/flightBookingsTable";

const addBookingDetails = async (req: Request, res: Response, next: NextFunction) => {
 const {user} = res.locals;
 const userId = user?.id;

 const details = req.body;

 try {
  if(!Array.isArray(details)) {
   return res.status(400).json({message: 'Expected Some booking details not an empty List'});
  };

  let invoiceNo: string | number = "";

  const invoices = await Invoices.findAll({limit: 1, order: [['createdAt', 'DESC']]});

  if(!invoices?.length) {
   invoiceNo  = "ID/2425/1";
  } else {
   const invoice = invoices?.[0];
   invoiceNo = invoice?.dataValues?.InvoiceNo?.split("/")?.[2];
  };

  const InvoiceId = !invoices?.length ? 1 : Number(invoices?.[0]?.InvoiceId) + 1;
  const InvoiceNo = !invoices?.length ? invoiceNo : `ID/2425/${Number(invoiceNo) + 1}`;

  const tboAmount = Number(details?.reduce((acc, defVal) => acc + Number(defVal?.tboAmount), 0)).toFixed(2);
  const tbkAmount = Number(details?.reduce((acc, defVal) => acc + Number(defVal?.tbkAmount), 0)).toFixed(2);

  await Invoices.create({InvoiceId, InvoiceNo, tboAmount, tbkAmount, userId});

  const getUser = await Users.findOne({where: {id: userId}});

  const leadPax = details?.[0]?.Passenger?.find((traveller: Record<string, unknown>) => traveller?.IsLeadPax);
  const totalPassengers = details?.[0]?.Passenger?.length as number;

  const ledgers = details?.map((booking: FlightBookingTypes & {paymentMethod: string}) => {
   const segments = (booking?.Segments as any);
   const {DepTime} = segments?.[0]?.Origin;
   const {AirlineCode, FlightNumber} = segments?.[0]?.Airline;
   const {Title, FirstName, LastName} = leadPax;

   const getCities = () => {
    const route = [segments?.[0]?.Origin?.Airport?.CityName];
    segments?.forEach((segment: any) => route?.push(segment?.Destination?.Airport?.CityName));
    return route?.join(' → ');
   };

   const pax = `${Title} ${FirstName} ${LastName} ${totalPassengers > 1 ? `+ ${Number(totalPassengers) - 1}` : ""}`;

   return {
    type: "Invoice",
    addedBy: "TBK-Booking-Flight",
    debit: booking?.paymentMethod === "wallet" ? tbkAmount : 0,
    credit: 0,
    balance: (Number(getUser?.tbkCredits) - Number(booking?.paymentMethod === "Wallet" ? booking?.tbkAmount : 0)).toFixed(2),
    InvoiceNo,
    PaxName: pax,
    userId,
    particulars: {
     "Ticket Created": pax,
     [getCities()]: `PNR ${booking?.PNR}`,
     "Travel Date" : `${dayjs(DepTime).format('DD MMM YYYY, hh:mm A')}, By ${AirlineCode} ${FlightNumber}`,
    },
   };
  }) as LedgerType[];

  await Ledgers?.bulkCreate(ledgers);

  const bookings = details?.map((booking: FlightBookingTypes) => ({
   bookingId: booking?.bookingId,
   TraceId: booking?.TraceId,
   PNR: booking?.PNR,
   tboAmount: Number(booking?.tboAmount).toFixed(2),
   tbkAmount: Number(booking?.tbkAmount).toFixed(2),
   bookedDate: booking?.bookedDate || new Date(),
   InvoiceNo,
   InvoiceId,
   Passenger: booking?.Passenger,
   Segments: booking?.Segments,
   IsLCC: booking?.IsLCC,
   flightStatus: booking?.flightStatus,
   userId,
   ...(booking?.isFlightCombo ? {isFlightCombo: true} : {}),
   ...(booking?.flightCities ? {flightCities: booking?.flightCities} : {}),
  })) as FlightBookingTypes[];

  const booking = await FlightBookings?.bulkCreate(bookings);

  return res.status(201).json({data: booking});
 } catch (error) {
  next(error);
 }
};

export default addBookingDetails;