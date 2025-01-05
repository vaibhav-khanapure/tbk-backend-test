import type {Request, Response, NextFunction} from "express";
import Invoices from "../../database/tables/invoicesTable";
import Ledgers, {type LedgerType} from "../../database/tables/ledgerTable";
import Users from "../../database/tables/usersTable";
import dayjs from "dayjs";
import FlightBookings, {type FlightBookingTypes} from "../../database/tables/flightBookingsTable";
import Payments from "../../database/tables/paymentsTable";
import generateTransactionId from "../../utils/generateTransactionId";

const addBookingDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {id: userId} = res.locals?.user;
  const {details, TrxnId} = req.body;

  if(!Array.isArray(details)) return res.status(400).json({message: "Please send List of Bookings"});

  // Fetching user and Last Inserted Invoice
  const [user, invoice] = await Promise.all([
   Users.findOne({ where: { id: userId } }),
   Invoices.findOne({ limit: 1, order: [["createdAt", "DESC"]] }),
  ]);

  let invoiceNo: string | number = "";

  if(!invoice) {
   invoiceNo  = "ID/2425/1";
  } else {
   invoiceNo = invoice?.dataValues?.InvoiceNo?.split("/")?.[2];
  };

  const InvoiceId = !invoice  ? 1 : Number(invoice?.InvoiceId) + 1;
  const InvoiceNo = !invoice? invoiceNo : `ID/2425/${Number(invoiceNo) + 1}`;

  const tboAmount = Number(details?.reduce((acc, defVal) => acc + Number(defVal?.tboAmount), 0)).toFixed(2);
  const tbkAmount = Number(details?.reduce((acc, defVal) => acc + Number(defVal?.tbkAmount), 0)).toFixed(2);

  const leadPax = details?.[0]?.Passenger?.find((traveller: Record<string, unknown>) => traveller?.IsLeadPax);
  const totalPassengers = details?.[0]?.Passenger?.length as number;

  const getCitiesInfo = () => {
   if(!TrxnId) return "";

   const bookings = (details as FlightBookingTypes[]);
   const origin = bookings?.[0];

   const Origin = origin?.Segments?.[0]?.Origin?.Airport?.CityName;
   const destination = origin?.Segments?.[origin?.Segments?.length - 1]?.Destination?.Airport?.CityName;

   if(details?.length === 1) {
    if(!origin?.isFlightCombo) return `Booking of One way flight from ${Origin} to ${destination}`;

    if(origin?.isFlightCombo) {
     const dest = origin?.Segments?.find(Segment => Segment?.Origin?.Airport?.CityCode === origin?.flightCities?.destination);
     const Dest = dest?.Origin?.Airport?.CityName;
     return `Booking of Return Trip flight from ${Origin} to ${Dest}`;
    };
   } else {
    const destination = bookings?.[1]?.Segments?.[0]?.Origin?.Airport?.CityName;
    return `Booking of Return Trip flight from ${Origin} to ${destination}`;
   };
  };

  const ledgers = details?.map((booking: FlightBookingTypes & {paymentMethod: string}, index) => {
   const segments = booking?.Segments;

   const {DepTime} = segments?.[0]?.Origin;
   const {AirlineCode, FlightNumber} = segments?.[0]?.Airline;
   const {Title, FirstName, LastName} = leadPax;

   const getCities = () => {
    const origin = segments?.[0]?.Origin?.Airport?.CityName;

    if(booking?.isFlightCombo) {
     const dest = segments?.find(segment => segment?.Origin?.Airport?.CityCode === booking?.flightCities?.destination);
     const destination = dest?.Origin?.Airport?.CityName;

     return `${origin} → ${destination} → ${origin}`;
    };

    const destination = segments?.[segments?.length - 1]?.Destination?.Airport?.CityName;
    return `${origin} → ${destination}`;

    /*
    This code show all cities including stops
    const route = [segments?.[0]?.Origin?.Airport?.CityName];
    segments?.forEach((segment) => route?.push(segment?.Destination?.Airport?.CityName));
    return route?.join(' → ');
    */
   };

   const pax = `${Title} ${FirstName} ${LastName}${totalPassengers > 1 ? ` + ${Number(totalPassengers) - 1}` : ""}`;

   let balance = Number(user?.tbkCredits);

   if (booking?.paymentMethod === "wallet") {
    if (index === 0 && details?.length === 2) {
     const destAmount = details?.[1]?.tbkAmount;
     balance += Number(destAmount);
    };
   };

   let TransactionId = TrxnId;

   if (!TransactionId) TransactionId = generateTransactionId();

   return {
    type: "Invoice",
    debit: booking?.paymentMethod === "wallet" ? Number(booking?.tbkAmount)?.toFixed(2) : 0,
    credit: 0,
    balance: Number(balance)?.toFixed(2),
    InvoiceNo,
    PaxName: pax,
    paymentMethod: booking?.paymentMethod,
    addedBy: user?.id,
    TransactionId,
    userId,
    particulars: {
     "Ticket Created": pax,
     [getCities()]: `PNR ${booking?.PNR}`,
     "Travel Date" : `${dayjs(DepTime).format('DD MMM YYYY, hh:mm A')}, By ${AirlineCode} ${FlightNumber}`,
     "Payment Method": booking?.paymentMethod,
    },
   };
  }) as LedgerType[];

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

  const result = await Promise.all([
   await Invoices.create({InvoiceId, InvoiceNo, tboAmount, tbkAmount, userId}),
   await Ledgers?.bulkCreate(ledgers),
   await FlightBookings?.bulkCreate(bookings),
   // Check for payment method
   ...(TrxnId ? await Payments.update({
     InvoiceNo,
     Reason: getCitiesInfo(),
   }, {where: {TransactionId: TrxnId}}) : [])
  ]);

  const booking = result?.[2];

  return res.status(201).json({data: booking});
 } catch (error) {
  next(error);
 }
};

export default addBookingDetails;