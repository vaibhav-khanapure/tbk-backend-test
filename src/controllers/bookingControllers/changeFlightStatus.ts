import type {NextFunction, Request, Response} from "express";
import prisma from "../../config/prisma";

const changeFlightStatus = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {data: {userId, id}, flightStatus, cancelRequestStatus} = req.body;

  // Update flightStatus where userId and Id match
  const updatedData = await prisma.bookingDetails.updateMany({
   where: {id},
   data: {flightStatus, changeRequestId: cancelRequestStatus},
  });

  if(updatedData.count > 0) return res.status(200).json({ updatedData });
  return res.status(404).json({ message: "No matching booking found" });      
 } catch (error) {
  next(error);
 };
};

export default changeFlightStatus;