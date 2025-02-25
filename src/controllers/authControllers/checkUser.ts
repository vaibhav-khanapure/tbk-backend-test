import "dotenv/config";
import jwt from "jsonwebtoken";
import type {NextFunction, Request, Response} from "express";
import Users from "../../database/tables/usersTable";

const checkUser = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const id = res.locals?.user?.id;

  if (!id) return res.status(401).json({message: "Unauthorized"});

  const exclude = ["id", "role", "email_verified_at", "remember_token", "password", "disableTicket", "created_at", "updated_at", "deleted_at", "updatedByStaffId"];

  const user = await Users.findByPk(id, { attributes: {exclude}, raw: true });

  if (!user) return res.status(404).json({message: "No user found"});
  if (!user?.active) {
   return res.status(400).json({message: "Please contact user admin to enable your Account"});
  };

  const {active, groupId, ...userdata} = user;
  const userDetails = {...userdata} as unknown as Record<string, string>;

  Object.keys(userDetails)?.forEach(key => {
   if (!userDetails?.[key]) delete userDetails?.[key];
  });

  const jwtData = {id, name: user?.name, email: user?.email, groupId};

  const token = jwt.sign(jwtData, process.env.ACCESS_TOKEN_KEY as string);

  return res.status(200).json({user: userDetails, token});
 } catch (error) {
  next(error);
 };
};

export default checkUser;