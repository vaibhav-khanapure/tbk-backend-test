import type {Request, Response, NextFunction} from "express";
import prisma from "../../../../server/db/connect";

const addUnsuccesfullFlightsDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const unsuccessfulDetails = req.body;
  const {user} = res.locals;
  const userId = user?.id;

  if(Object.keys(unsuccessfulDetails).length === 0) {
   return res.status(400).json({message: 'Expected Some unsuccessfull details not empty object'});
  };

  // Insert each traveller detail into the database
  const cancelData = await prisma.unsuccesfullFlights.create({
   data: {
    totalAmount:JSON.stringify(unsuccessfulDetails.totalAmount),
    bookedDate:unsuccessfulDetails?.bookedDate,
    flightStatus:unsuccessfulDetails?.flightStatus,
    userId,  // Foreign key to User model,
    Origin:unsuccessfulDetails.Origin,
    Destination:unsuccessfulDetails.Destination,
    OriginDate:new Date(unsuccessfulDetails.OriginDate),
    DestinationDate:new Date(unsuccessfulDetails.DestinationDate)
   }
  });
  
  return res.status(201).json({ data: cancelData });
 } catch (error) {
  next(error);
 };
};

export default addUnsuccesfullFlightsDetails;