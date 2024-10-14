import type {NextFunction, Request, Response} from "express";
import prisma from "../../config/prisma";

const getUnsuccessfullDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = req.body.userId
  const data = await prisma.unsuccesfullFlights.findMany({ where: {userId} });
  return res.status(200).json({data}); 
 } catch (error) {
  next(error);
 };
};

export default getUnsuccessfullDetails;