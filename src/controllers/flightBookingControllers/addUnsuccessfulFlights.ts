import type {Request, Response, NextFunction} from "express";
import UnsuccessfulFlights, {type UnsuccessfulFlightsTypes} from "../../database/tables/unsuccessfulFlightsTable";
import Ledgers, {type LedgerType} from "../../database/tables/ledgerTable";
import Users from "../../database/tables/usersTable";
import dayjs from "dayjs";
import type {Segment} from "../../types/BookedFlights";

const addUnsuccesfulFlights = async (req: Request, res: Response, next: NextFunction) => {
 const unsuccessfulDetails = req.body;
 const {id: userId} = res.locals?.user;
 
 if(!Array.isArray(unsuccessfulDetails)) return res.status(400).json({message: 'Please send an Array of Flights'});

 try {
  const flights = unsuccessfulDetails?.map((flight: UnsuccessfulFlightsTypes, index) => {
   const data = {...flight, userId};

   data.RefundedAmount = Number(flight?.bookingAmount)?.toFixed(2);
   data.Reason = flight?.Reason || "Booking failed from supplier side";
   data.RefundStatus = "Approved";
   data.RefundedOn = new Date();
   data.RefundProcessedOn = new Date();
   data.RefundedUntil = new Date();

   if(index > 0) data.travellers = unsuccessfulDetails?.[0]?.travellers;
   return data;
  });

  const getCities = (segments: Segment[][]) => {
   let info = "";

   const origin = segments?.[0]?.[0]?.Origin?.Airport?.CityName;
   const dest = segments?.[0]?.[segments?.[0]?.length - 1]?.Destination?.Airport?.CityName;

   if(segments?.length > 1) info = `Return Trip from ${origin} to ${dest}`;
   else `One Way flight from ${origin} to ${dest}`;
   return info;
  };

  const amount = unsuccessfulDetails?.reduce((acc, defVal) => Number(defVal?.bookingAmount || 0) + Number(acc), 0);
  const user = await Users.findOne({where: {id: userId}});

  const tbkCredits = Number(Number(user?.tbkCredits) + amount)?.toFixed(2);

  await Users.update({tbkCredits}, {where: {id: userId}});

  const ledgers = flights?.map(flight => {
   const data = {
    addedBy: "TBK-Flight-Booking",
    balance: (Number(user?.tbkCredits) - Number(flight?.bookingAmount)).toFixed(2),
    credit: Number(flight?.bookingAmount)?.toFixed(2),
    debit: 0,
    PaxName: user?.name,
    type: "Refund",
    userId,
    particulars: {
     "Flight Booking Unsuccessful": `${getCities(flight?.Segments as Segment[][])}`,
     "Amount Refunded": Number(flight?.bookingAmount)?.toFixed(2),
     "Booking Failed On" : `${dayjs().format('DD MMM YYYY, hh:mm A')}`,
    },
   } as LedgerType;

   return data;
  });

  await Ledgers.bulkCreate(ledgers);

  const data = await UnsuccessfulFlights?.bulkCreate(flights);
  return res.status(201).json({data});
 } catch (error) {
  next(error);
 };
};

export default addUnsuccesfulFlights;