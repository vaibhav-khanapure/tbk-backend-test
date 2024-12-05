import type {Request, Response, NextFunction} from "express";
import TravellerDetails from "../../database/tables/travellerDetailsTable";

const deleteTraveller = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {user} = res?.locals;
  const userId = user?.id;

  const {travellerIds} = req.query as {travellerIds: string[]};

  if (!Array.isArray(travellerIds)) {
   return res.status(400).json({message: 'Invalid input format. Expected an array of traveller IDs'});
  };

  const results = await TravellerDetails.destroy({where: {id: travellerIds, userId}});
  return res.status(201).json({data: results});
 } catch (error) {
  next(error);
 };
};

export default deleteTraveller;