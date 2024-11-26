import type {NextFunction, Request, Response} from "express";
import BookingDetails from "../../database/tables/bookingDetailsTable";

const getTicketDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {user} = res.locals;
  const userId = user?.id;
  const data = await BookingDetails.findAll({where: {userId}});
  return res.status(200).json({data});
 } catch (error) {
  next(error);
 };
};

export default getTicketDetails;