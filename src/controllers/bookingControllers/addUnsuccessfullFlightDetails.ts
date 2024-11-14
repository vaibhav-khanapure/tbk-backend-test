import type {Request, Response, NextFunction} from "express";
import UnsuccessfullFlights from "../../database/tables/unsuccessFullFlightsTable";

const addUnsuccesfullFlightsDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const unsuccessfullDetails = req.body;
  const {user} = res.locals;
  const userId = user?.id;

  if(!Object.keys(unsuccessfullDetails).length) {
   return res.status(400).json({message: 'Expected Some unsuccessfull details not empty object'});
  };

  const data = await UnsuccessfullFlights.create({
   totalAmount: String(unsuccessfullDetails?.totalAmount),
   bookedDate: unsuccessfullDetails?.bookedDate || new Date().toISOString(),
   flightStatus: unsuccessfullDetails?.flightStatus || "unsuccessfull",
   Origin: unsuccessfullDetails?.Origin,
   Destination: unsuccessfullDetails?.Destination,
   OriginDate: new Date(unsuccessfullDetails?.OriginDate),
   DestinationDate: new Date(unsuccessfullDetails?.DestinationDate),
   userId,
  });

  return res.status(201).json({data});
 } catch (error) {
  next(error);
 };
};

export default addUnsuccesfullFlightsDetails;