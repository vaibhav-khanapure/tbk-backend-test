import type {NextFunction, Request, Response} from "express";
import AirportList from "../../database/tables/airportListTable";
import {Op} from "sequelize";

const fetchAirportList = async(req: Request, res: Response, next: NextFunction) => {
 try {
  const data = await AirportList.findAll({ where: { airportName: { [Op.ne]: null }, }});
  return res.status(200).json({count: data.length, data}); 
 } catch (error) {
  next(error);
 };
};

export default fetchAirportList;