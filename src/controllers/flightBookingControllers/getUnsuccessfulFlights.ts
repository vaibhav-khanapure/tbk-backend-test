import type {NextFunction, Request, Response} from "express";
import UnsuccessfulFlights from "../../database/tables/unsuccessfulFlightsTable";

const getUnsuccessfulFlights = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res.locals?.user?.id;
  if (!userId) return res.status(401).json({message: "Unauthorized"});

  const data = await UnsuccessfulFlights.findAll({
   where: {userId},
   raw: true,
   attributes: {
    exclude: ["id", "userId", "updatedAt", "paymentMethod", "RefundedUntil", "travellers", ]
   }
  });

  return res.status(200).json({data}); 
 } catch (error) {
  next(error);
 };
};

export default getUnsuccessfulFlights;