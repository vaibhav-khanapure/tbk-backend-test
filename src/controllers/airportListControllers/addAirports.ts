import type {NextFunction,Request,Response} from "express";
import AirportList from "../../database/tables/airportListTable";

const addAirports = async (req: Request,res: Response,next: NextFunction) => {
 const {airports} = req.body;
 if(!Array.isArray(airports)) return res.status(400).json({message: "Please send lit of Airports"});
 
 try {
  const data = await AirportList?.bulkCreate(airports)
  return res.status(200).json({count: data.length, data});
 } catch(error) {
  next(error);
 };
};

export default addAirports;