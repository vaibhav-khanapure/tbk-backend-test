import type {NextFunction, Request, Response} from "express";
import SavedTravellers from "../../database/tables/savedTravellersTable";

const getSavedTravellers = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res.locals?.user?.id;

  if (!userId) return res.status(401).json({message: "Unauthorized"});

  const data = await SavedTravellers?.findAll({
   where: {userId},
   raw: true,
   attributes: {exclude: ["created_at", "updated_at", "userId"]}
  });

  return res.status(200).json({data});
 } catch (error: any) {
  next(error);
 };
};

export default getSavedTravellers;