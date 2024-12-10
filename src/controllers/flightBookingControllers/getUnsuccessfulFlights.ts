import type {NextFunction, Request, Response} from "express";
import UnsuccessfulFlights from "../../database/tables/unsuccessfulFlightsTable";

const getUnsuccessfulFlights = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {id: userId} = res.locals?.user;
  const data = await UnsuccessfulFlights.findAll({where: {userId}});
  return res.status(200).json({data}); 
 } catch (error) {
  next(error);
 };
};

export default getUnsuccessfulFlights;