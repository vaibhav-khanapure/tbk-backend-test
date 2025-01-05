import type {Request, Response, NextFunction} from "express";
import SavedTravellers from "../../database/tables/savedTravellersTable";

const updateTraveller = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {id: userId} = res?.locals?.user;

  const results = await SavedTravellers?.update(req.body, {where: {id: req.body?.id, userId}});
  return res.status(200).json({data: results});
 } catch (error) {
  next(error);
 };
};

export default updateTraveller;