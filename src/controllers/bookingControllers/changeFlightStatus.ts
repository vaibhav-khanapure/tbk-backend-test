import type {NextFunction, Request, Response} from "express";
import BookingDetails from "../../database/tables/bookingDetailsTable";

const changeFlightStatus = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {data: {id}, flightStatus, cancelRequestStatus} = req.body;

  const data = await BookingDetails.update(
   {flightStatus, changeRequestId: cancelRequestStatus},
   {where: {id}},
  );

  const updatedData = await BookingDetails.findOne({ where: { id: 1 } });

  if(data?.[0] > 0) return res.status(200).json({ updatedData });
  return res.status(404).json({ message: "No matching booking found" });      
 } catch (error) {
  next(error);
 };
};

export default changeFlightStatus;