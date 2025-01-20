import type {NextFunction, Request, Response} from "express";
import FlightBookings from "../../database/tables/flightBookingsTable";

const getBookedFlightDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res.locals?.user?.id;
  const data = await FlightBookings?.findAll({where: {userId}});
  return res.status(200).json({data});
 } catch (error) {
  next(error);
 };
};

export default getBookedFlightDetails;