import type {Request, Response, NextFunction} from "express";
import Users from "../../database/tables/usersTable";

const updateTBKCredits = async (req: Request, res: Response, next: NextFunction) => {
 const {id} = res.locals?.user;
 const {amount} = req.body;

 if (!Number(amount)) return res.status(400).json({message: 'Valid Amount is required'});

 try {
  const user = await Users.findOne({where: {id}});
  if (!user) return res.status(404).json({message: 'User not found'});

  const credits = Number(user?.dataValues?.tbkCredits);

  // Ensure the user has enough credits
  if (credits < Number(amount)) return res.status(400).json({ message: 'Insufficient TBK Credits' });

  const updatedUser = await Users.update({tbkCredits: credits - Number(amount)}, {where: {id}});
  return res.status(200).json({updatedUser});
 } catch (error: any) {
  next(error);
 };
};

export default updateTBKCredits;