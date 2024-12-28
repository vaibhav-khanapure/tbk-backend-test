import type {Request, Response, NextFunction} from "express";
import UnsuccessfulFlights, {type UnsuccessfulFlightsTypes} from "../../database/tables/unsuccessfulFlightsTable";
import Ledgers, {type LedgerType} from "../../database/tables/ledgerTable";
import Users from "../../database/tables/usersTable";
import dayjs from "dayjs";
import generateTransactionId from "../../utils/generateTransactionId";

const addUnsuccesfulFlights = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {unsuccessfulDetails, TrxnId} = req.body as {unsuccessfulDetails: UnsuccessfulFlightsTypes[], TrxnId: string};
  const {id: userId} = res.locals?.user;

  if(!Array.isArray(unsuccessfulDetails)) return res.status(400).json({message: 'Please send an Array of Flights'});

  const flights = unsuccessfulDetails?.map((flight, index) => {
   const data = {...flight, userId};

   data.RefundedAmount = Number(flight?.bookingAmount)?.toFixed(2);
   data.Reason = flight?.Reason || "Booking failed from supplier side";
   data.RefundStatus = "Approved";
   data.RefundCreditedDate = new Date();
   data.RefundProcessedOn = new Date();
   data.RefundedUntil = new Date();

   if(index > 0) {
    if (!data?.travellers) data.travellers = unsuccessfulDetails?.[0]?.travellers;
    if (!data?.paymentMethod) data.paymentMethod = unsuccessfulDetails?.[0]?.paymentMethod;
   };

   return data;
  });

  const user = await Users.findOne({where: {id: userId}});

  const ledgers = flights?.map((flight, index) => {
   const getCities = () => {
    const segments = flight?.Segments;

    const origin = segments?.[0]?.[0]?.Origin?.Airport?.CityName;

    if(flight?.isFlightCombo) {
     const destination = segments?.[1]?.[0]?.Origin?.Airport?.CityName;
     return `Return Trip from ${origin} to ${destination} and ${destination} to ${origin}`;
    };

    const dest = segments?.[0]?.[segments?.[0]?.length - 1]?.Destination?.Airport?.CityName;
    return `Flight from ${origin} to ${dest}`;
   };

   let prevBalance = 0;

   if(index === 1) prevBalance = Number(flights?.[0]?.bookingAmount);
 
   const balance = (Number(user?.tbkCredits) + Number(flight?.bookingAmount) + prevBalance).toFixed(2);

   let TransactionId = TrxnId;
   if(!TransactionId) TransactionId = generateTransactionId();

   const data = {
    addedBy: "TBK-Flight-Booking",
    balance,
    credit: Number(flight?.bookingAmount)?.toFixed(2),
    debit: 0,
    PaxName: user?.name,
    paymentMethod: flight?.paymentMethod,
    TransactionId,
    type: "Refund",
    userId,
    particulars: {
     "Flight Booking Unsuccessful": `${getCities()}`,
     "Amount Refunded": `${flight?.Currency} ${Number(flight?.bookingAmount)?.toFixed(2)}`,
     "Booking Failed On" : `${dayjs().format('DD MMM YYYY, hh:mm A')}`,
    },
   } as LedgerType;

   return data;
  });

  const amount = unsuccessfulDetails?.reduce((acc, defVal) => Number(defVal?.bookingAmount || 0) + Number(acc), 0);
  const tbkCredits = (Number(user?.tbkCredits) + Number(amount))?.toFixed(2);

  console.log({
    amount, tbkCredits, userId, numberTBKCredits: Number(tbkCredits), 
  }, "OG", user?.tbkCredits);

  const [data] = await Promise.all([
   await UnsuccessfulFlights?.bulkCreate(flights),
   await Ledgers.bulkCreate(ledgers),
   await Users.update({tbkCredits}, {where: {id: userId}}),
  ]);

  return res.status(201).json({data});
 } catch (error) {
  next(error);
 };
};

export default addUnsuccesfulFlights;