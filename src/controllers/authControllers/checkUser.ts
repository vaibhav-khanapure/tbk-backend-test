import type {NextFunction, Request, Response} from "express";
import Users from "../../database/tables/usersTable";

const checkUser = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const id = res.locals?.user?.id;
  const user = await Users.findOne({
   where: {id},
   attributes: {exclude: ["id", "active", "disableTicket", "createdAt", "updatedAt"]}
  });

  if (!user) return res.status(404).json({message: "No user found"});
  if (!user?.active) {
   return res.status(400).json({message: "Please contact user admin to enable your Account"});
  };

  return res.status(200).json({user});
 } catch (error) {
  next(error);
 };
};

export default checkUser;