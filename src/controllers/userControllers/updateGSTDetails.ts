import type {NextFunction, Request, Response} from "express";
import Users from "../../database/tables/usersTable";

const updateGSTDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {id} = res.locals?.user;
  await Users.update(req.body, {where: {id}});
  return res.status(200).json({success: true});
 } catch (error) {
  next(error);
 };
};

export default updateGSTDetails;