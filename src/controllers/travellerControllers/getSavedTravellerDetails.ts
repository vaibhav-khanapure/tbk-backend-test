import type {NextFunction, Request, Response} from "express";
import SavedTravellers from "../../database/tables/savedTravellersTable";

const getTravellerDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {user} = res.locals;
  const userId = user?.id;

  const data = await SavedTravellers?.findAll({where: {userId}});
  return res.status(200).json({data});
 } catch (error) {
  next(error);
 };
};

export default getTravellerDetails;