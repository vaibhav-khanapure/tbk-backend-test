import type {Request, Response, NextFunction} from "express";
import SavedTravellers from "../../database/tables/savedTravellersTable";

const deleteTravellers = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {user} = res?.locals;
  const userId = user?.id;
  const {travellerIds} = req.query as {travellerIds: string[]};

  if (!Array.isArray(travellerIds)) {
   return res.status(400).json({message: 'Invalid input format. Expected an array of traveller IDs'});
  };

  const results = await SavedTravellers?.destroy({where: {id: travellerIds, userId}});
  return res.status(201).json({data: results});
 } catch (error) {
  next(error);
 };
};

export default deleteTravellers;