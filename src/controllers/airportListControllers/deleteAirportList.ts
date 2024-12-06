import type {NextFunction, Request, Response} from "express";
import AirportList from "../../database/tables/airportListTable";

const deleteAirportList = async (req: Request, res: Response, next: NextFunction) => {
 const {all, airports} = req.query as unknown as {all?: boolean; airports: string[]};
 const data = all ? {} : {where: {id: airports}};

 try {
  const count = await AirportList.destroy(data);
  return res.status(200).json({deletedCount: count});
 } catch (error) {
  next(error);
 };
};

export default deleteAirportList;