import type {NextFunction, Request, Response} from "express";
import prisma from "../../config/prisma";

const fetchTravellerDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {user} = res.locals;
  const userId = user?.id;

  // Fetch all traveller details from the database
  const data = await prisma.travellerDetails.findMany({
   where: {userId}, // Fetch only records that belong to the logged-in user
  });

  // Send a success response with the fetched data
  return res.status(200).json({data});
 } catch (error) {
  next(error);
 };
};

export default fetchTravellerDetails;