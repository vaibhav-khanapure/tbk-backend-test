import type {Request, Response, NextFunction} from "express";
import SavedTravellers from "../../database/tables/savedTravellersTable";

const addNewTravellers = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res?.locals?.user?.id;
  const travellers = req.body;

  if (!userId) return res.status(401).json({message: 'Unauthorized'});

  if (!travellers || !Array.isArray(travellers)) {
   return res.status(400).json({message: 'Please send a list of Travellers'});
  };

  const newTravellers = travellers?.map((detail: SavedTravellers) => ({...detail, userId}));

  const results = await SavedTravellers?.bulkCreate(newTravellers, {});

  const list = results?.map(traveller => {
   const {userId, createdAt, updatedAt, ...data} = traveller?.get({plain: true});
   return data;
  });

  return res.status(201).json({data: list});
 } catch (error) {
  next(error);
 };
};

export default addNewTravellers;