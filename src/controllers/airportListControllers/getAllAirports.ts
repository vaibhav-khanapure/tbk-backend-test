import type {NextFunction,Request,Response} from "express";
import AirportList from "../../database/tables/airportListTable";

const getAllAirports = async (req: Request,res: Response,next: NextFunction) => {
 try {
  const data = await AirportList.findAll({raw: true});
  return res.status(200).json({count: data?.length, data});
 } catch(error) {
  next(error);
 };
};

export default getAllAirports;