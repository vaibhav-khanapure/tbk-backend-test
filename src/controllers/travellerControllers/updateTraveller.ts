import type {Request, Response, NextFunction} from "express";
import SavedTravellers from "../../database/tables/savedTravellersTable";

const updateTraveller = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res?.locals?.user?.id;
  const id = req.body.id;

  const results = await SavedTravellers?.update(req.body, {where: {id, userId}});
  return res.status(200).json({data: results});
 } catch (error) {
  next(error);
 };
};

export default updateTraveller;