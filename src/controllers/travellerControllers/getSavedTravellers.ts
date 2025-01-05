import type {NextFunction, Request, Response} from "express";
import SavedTravellers from "../../database/tables/savedTravellersTable";

const getSavedTravellers = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {id: userId} = res.locals?.user;

  const data = await SavedTravellers?.findAll({
   where: {userId},
   attributes: {exclude: ["createdAt", "updatedAt", "userId"]}
  });
  return res.status(200).json({data});
 } catch (error: any) {
  next(error);
 };
};

export default getSavedTravellers;