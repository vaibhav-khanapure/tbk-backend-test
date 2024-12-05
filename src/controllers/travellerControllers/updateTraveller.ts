import type {Request, Response, NextFunction} from "express";
import TravellerDetails from "../../database/tables/travellerDetailsTable";

const updateTraveller = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {user} = res?.locals;
  const userId = user?.id;

  const results = await TravellerDetails.update(req.body,{where: {id: req.body?.id, userId}});
  return res.status(200).json({data: results});
 } catch (error) {
  next(error);
 };
};

export default updateTraveller;