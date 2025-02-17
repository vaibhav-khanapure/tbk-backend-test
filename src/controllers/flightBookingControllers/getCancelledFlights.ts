import type {NextFunction, Request, Response} from "express";
import CancelledFlights from "../../database/tables/cancelledFlightsTable";

const getCancelledFlights = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res.locals?.user?.id;

  if (!userId) return res.status(401).json({message: "Unauthorized"});

  const data = await CancelledFlights?.findAll({
   where: {userId}, 
   raw: true,
   attributes: {
    exclude: ["userId", "updated_at", "id", "description", "updatedByStaffId"]
   }
  });

  const cancellations = data?.map(flight => {
   const Flight = {...flight} as Record<string, unknown>;
   Flight.cancelledTickets = flight?.cancelledTickets?.map(({RefundedAmount}) => ({RefundedAmount}));
   return Flight;
  });

  return res.status(200).json({data: cancellations});
 } catch (error) {
  next(error);
 };
};

export default getCancelledFlights;