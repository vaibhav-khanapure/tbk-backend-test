import type {NextFunction, Request, Response} from "express";
import TravellerDetails from "../../database/tables/travellerDetailsTable";

const getTravellerDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {user} = res.locals;
  const userId = user?.id;

  const data = await TravellerDetails?.findAll({where: {userId}});
  return res.status(200).json({data});
 } catch (error) {
  next(error);
 };
};

export default getTravellerDetails;