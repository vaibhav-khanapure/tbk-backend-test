import type {Request, Response, NextFunction} from "express";
import SavedTravellers from "../../database/tables/savedTravellersTable";

const addNewTravellers = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res?.locals?.user?.id;
  const travellers = req.body;

  if (!travellers || !Array.isArray(travellers)) {
   return res.status(400).json({message: 'Please send a list of Travellers'});
  };

  const results = await SavedTravellers?.bulkCreate(travellers?.map((detail: SavedTravellers) => ({...detail, userId})));

  return res.status(201).json({data: results});
 } catch (error) {
  next(error);
 };
};

export default addNewTravellers;