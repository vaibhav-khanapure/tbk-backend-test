import type {NextFunction, Request, Response} from "express";
import prisma from "../../config/prisma";

const getTicketDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {userId} = req.body
  const data = await prisma.bookingDetails.findMany({ where: {userId},});
  return res.status(200).json({ data }); 
 } catch (error) {
  next(error);
 };
};

export default getTicketDetails;