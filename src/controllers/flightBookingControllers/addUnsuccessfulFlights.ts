import type {Request, Response, NextFunction} from "express";
import UnsuccessfulFlights, { type UnsuccessfulFlightsTypes } from "../../database/tables/unsuccessfulFlightsTable";

const addUnsuccesfulFlights = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const unsuccessfulDetails = req.body;
  const {id: userId} = res.locals?.user;

  if(!Array.isArray(unsuccessfulDetails)) return res.status(400).json({message: 'Please send an Array of Flights'});

  const flights = unsuccessfulDetails?.map((flight: UnsuccessfulFlightsTypes, index) => {
   const data = {...flight, userId};

   data.RefundedAmount = flight?.bookingAmount;
   data.Reason = flight?.Reason || "Booking failed from supplier side";
   data.RefundStatus = "Approved";
   data.RefundedOn = new Date();
   data.RefundProcessedOn = new Date();
   data.RefundedUntil = new Date();

   if(index > 0) data.travellers = unsuccessfulDetails?.[0]?.travellers;
   return data;
  });

  const data = await UnsuccessfulFlights?.bulkCreate(flights);
  return res.status(201).json({data});
 } catch (error) {
  next(error);
 };
};

export default addUnsuccesfulFlights;