import type {NextFunction, Request, Response} from "express";
import UnsuccessfulFlights from "../../database/tables/unsuccessfulFlightsTable";
import UnsuccessfulHotels from "../../database/tables/unsuccessfulHotelsTable";

const getUnsuccessfulFlights = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res.locals?.user?.id;
  if (!userId) return res.status(401).json({message: "Unauthorized"});

  const [flights, hotels] = await Promise.all([
   UnsuccessfulFlights.findAll({
    where: {userId},
    raw: true,
    attributes: {
     exclude: ["id", "userId", "updated_at", "paymentMethod", "RefundedUntil", "travellers", ]
    }
   }),
   UnsuccessfulHotels.findAll({
    where: {userId},
    raw: true,
    attributes: ["Reason", "Currency", "RefundedAmount", "RefundProcessedOn", "RefundCreditedDate", "RefundedUntil", "paymentMethod",	"RefundStatus",	"bookingData", "created_at"]
   })
  ]);

  return res.status(200).json({flights, hotels}); 
 } catch (error) {
  next(error);
 };
};

export default getUnsuccessfulFlights;