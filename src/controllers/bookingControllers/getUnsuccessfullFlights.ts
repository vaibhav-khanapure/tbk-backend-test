import type {NextFunction, Request, Response} from "express";
import UnsuccessfullFlights from "../../database/tables/unsuccessFullFlightsTable";

const getUnsuccessfullFlights = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {id: userId} = res.locals?.user;
  const data = await UnsuccessfullFlights.findAll({where: {userId}});
  return res.status(200).json({data}); 
 } catch (error) {
  next(error);
 };
};

export default getUnsuccessfullFlights;