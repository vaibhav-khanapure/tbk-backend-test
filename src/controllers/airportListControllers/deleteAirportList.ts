import type {NextFunction, Request, Response} from "express";
import AirportList from "../../database/tables/airportListTable";

const deleteAirportList = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const count = await AirportList.destroy({});
  return res.status(200).json({deletedCount: count});
 } catch (error) {
  next(error);
 };
};

export default deleteAirportList;