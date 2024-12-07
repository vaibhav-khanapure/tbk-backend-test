import type {NextFunction, Request, Response} from "express";
import Users from "../../database/tables/usersTable";

const checkUser = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {id} = res.locals?.user;
  const user = await Users.findOne({where: {id}});

  if(!user) return res.status(404).json({message: "No user found"});
  return res.status(200).json({user});
 } catch (error) {
  next(error);
 };
};

export default checkUser;