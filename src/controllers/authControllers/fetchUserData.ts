import type {NextFunction, Request, Response} from "express";
import Users from "../../database/tables/usersTable";

const fetchUserData = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {emailId} = req.body;
  if(!emailId) return res.status(400).json({message: 'Email ID is required'});

  const user = await Users.findOne({
   where: { emailId },
   attributes: {exclude: ["password"]}
  });

  if (!user) return res.status(404).json({message: 'User not found'});

  return res.status(200).json({ user });
 } catch (error) {
  next(error);
 };
};

export default fetchUserData;