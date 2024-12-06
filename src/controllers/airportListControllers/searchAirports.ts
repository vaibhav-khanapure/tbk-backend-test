import type {NextFunction,Request,Response} from "express";
import AirportList from "../../database/tables/airportListTable";
import {Op} from "sequelize";

const searchAirports = async (req: Request,res: Response,next: NextFunction) => {
 const {value, limit = 10} = req.query;
 
 try {
  const data = await AirportList.findAll({
   where: {
    [Op.or]: [
     {cityCode: {[Op.like]: `%${value}%`}},
     {cityName: {[Op.like]: `%${value}%`}},
     {countryCode: {[Op.like]: `%${value}%`}},
     {airportCode: {[Op.like]: `%${value}%`}},
     {countryName: {[Op.like]: `%${value}%`}},
     {airportName: {[Op.like]: `%${value}%`}},
    ],
   },
   limit: Number(limit || 10),
  });

  return res.status(200).json({count: data.length, data});
 } catch(error) {
  next(error);
 };
};

export default searchAirports;