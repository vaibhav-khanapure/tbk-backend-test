import type {NextFunction, Request, Response} from "express";
import FlightBookings from "../../database/tables/flightBookingsTable";

const changeFlightStatus = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {data: {id}, flightStatus, cancelRequestStatus} = req.body;

  const data = await FlightBookings?.update(
   {flightStatus, changeRequestId: cancelRequestStatus},
   {where: {id}},
  );

  const updatedData = await FlightBookings?.findOne({ where: { id: 1 } });

  if(data?.[0] > 0) return res.status(200).json({ updatedData });
  return res.status(404).json({ message: "No matching booking found" });      
 } catch (error) {
  next(error);
 };
};

export default changeFlightStatus;