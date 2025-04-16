import "dotenv/config";
import type {NextFunction, Request, Response} from "express";
import Users from "../../database/tables/usersTable";
import jwt from "jsonwebtoken";

const updateName = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const id = res.locals?.user?.id;
  const email = res.locals?.user?.email;
  const groupId = res.locals?.user?.groupId;
  const name = req.body?.name;

  if (!id) return res.status(401).json({message: "Unauthorized"});

  await Users.update({name}, {where: {id}});

  const jwtData = {
   id, 
   name, 
   email,
   sub: id,
  } as Record<string, string>;

  if (groupId) jwtData["groupId"] = groupId;

  const token = jwt.sign(jwtData, process.env.JWT_SECRET_KEY as string);

  return res.status(200).json({token});
 } catch (error) {
  next(error);
 };
};

export default updateName;