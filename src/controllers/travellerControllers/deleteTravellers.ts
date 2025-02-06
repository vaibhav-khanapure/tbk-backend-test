import type {Request, Response, NextFunction} from "express";
import SavedTravellers from "../../database/tables/savedTravellersTable";

const deleteTravellers = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res?.locals?.user?.id;
  const travellerIds = req.query?.travellerIds as {travellerIds: string[]};

  if (!userId) return res.status(401).json({message: 'Unauthorized'});

  if (!travellerIds || !Array.isArray(travellerIds)) {
   return res.status(400).json({message: 'Invalid input format. Expected an array of traveller IDs'});
  };

  await SavedTravellers?.destroy({ where: {id: travellerIds, userId} });
  return res.status(201).json({success: true});
 } catch (error) {
  next(error);
 };
};

export default deleteTravellers;