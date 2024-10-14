import type {NextFunction, Request, Response} from "express";
import prisma from "../../config/prisma";

const deleteAirportList = async (req: Request, res: Response, next: NextFunction) => {
 try {
  // Delete all records where airportName is not null (or any other condition)
  const deletedData = await prisma.airportList.deleteMany({
   // where: {
   //   airportName: {
   //     not: null, // You can modify the condition if necessary
   //   },
   // },
  });
      
  return res.status(200).json({ deletedCount: deletedData.count });
 } catch (error) {
  next(error);
 };
};

export default deleteAirportList;