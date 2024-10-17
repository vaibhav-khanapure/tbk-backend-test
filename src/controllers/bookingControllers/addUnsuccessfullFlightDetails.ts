import type {Request, Response, NextFunction} from "express";
import UnsuccessfullFlights from "../../database/tables/unsuccessFullFlightsTable";

const addUnsuccesfullFlightsDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const unsuccessfulDetails = req.body;
  const {user} = res.locals;
  const userId = user?.id;

  if(Object.keys(unsuccessfulDetails).length === 0) {
   return res.status(400).json({message: 'Expected Some unsuccessfull details not empty object'});
  };

  // Insert each traveller detail into the database
  const data = await UnsuccessfullFlights.create({
    totalAmount: JSON.stringify(unsuccessfulDetails.totalAmount),
    bookedDate: unsuccessfulDetails?.bookedDate,
    flightStatus: unsuccessfulDetails?.flightStatus,
    userId,
    Origin: unsuccessfulDetails.Origin,
    Destination: unsuccessfulDetails.Destination,
    OriginDate: new Date(unsuccessfulDetails.OriginDate),
    DestinationDate: new Date(unsuccessfulDetails.DestinationDate)
  });

  return res.status(201).json({data});
 } catch (error) {
  next(error);
 };
};

export default addUnsuccesfullFlightsDetails;