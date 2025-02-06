import type {NextFunction, Request, Response} from "express";
import Users from "../../database/tables/usersTable";

const checkUser = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const id = res.locals?.user?.id;

  if (!id) return res.status(401).json({message: "Unauthorized"});

  const user = await Users.findOne({
   where: {id},
   attributes: {exclude: ["id", "disableTicket", "createdAt", "updatedAt"]},
   raw: true,
  });

  if (!user) return res.status(404).json({message: "No user found"});
  if (!user?.active) {
   return res.status(400).json({message: "Please contact user admin to enable your Account"});
  };

  const {active, ...userdata} = user;
  const userDetails = {...userdata} as unknown as Record<string, string>;

  Object.keys(userDetails)?.forEach(key => !userDetails?.[key] && delete userDetails?.[key]);

  return res.status(200).json({user: userDetails});
 } catch (error) {
  next(error);
 };
};

export default checkUser;