import type {NextFunction, Request, Response} from "express";
import Users from "../../database/tables/usersTable";

const updateName = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const id = res.locals?.user?.id;
  await Users.update(req.body, {where: {id}});
  return res.status(200).json({success: true});
 } catch (error) {
  next(error);
 };
};

export default updateName;