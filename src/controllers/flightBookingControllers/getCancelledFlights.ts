import type {NextFunction, Request, Response} from "express";
import CancelledFlights from "../../database/tables/cancelledFlightsTable";

const getCancelledFlights = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res.locals?.user?.id;
  const data = await CancelledFlights?.findAll({where: {userId}});
  return res.status(200).json({data});
 } catch (error) {
  next(error);
 };
};

export default getCancelledFlights;