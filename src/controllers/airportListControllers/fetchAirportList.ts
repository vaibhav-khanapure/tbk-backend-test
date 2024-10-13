import type {NextFunction, Request, Response} from "express";
import prisma from "../../config/prisma";

const fetchAirportList = async(req: Request, res: Response, next: NextFunction)=>{
 try {
  const data = await prisma.airportList.findMany({
   where: { airportName: { not: null, }, },
  });

  return res.status(200).json({count: data.length, data}); 
 } catch (error) {
//   next(error);
  return res.status(500).json({ message: 'Error in server proxy' });
 };
};

export default fetchAirportList;