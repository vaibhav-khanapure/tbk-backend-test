import type {NextFunction, Request, Response} from "express";
import FlightBookings from "../../database/tables/flightBookingsTable";

const getBookedFlightDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {id: userId} = res.locals?.user;
  const data = await FlightBookings?.findAll({where: {userId}});
  return res.status(200).json({data});
 } catch (error) {
  next(error);
 };
};

export default getBookedFlightDetails;