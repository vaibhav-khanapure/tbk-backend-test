import type {Request, Response, NextFunction} from "express";
import Users from "../../database/tables/usersTable";

const flightBookWithTBKCredits = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const id = res.locals?.user?.id;
  let amount = req.body?.amount;

  if (!Number(amount)) return res.status(400).json({message: "Valid Amount is required"});

  amount = Number(amount);

  const user = await Users.findOne({where: {id}, attributes: ["tbkCredits"]});
  if (!user) return res.status(404).json({message: "User not found"});

  const credits = Number(user?.tbkCredits);

  // Ensure the user has enough credits
  if (credits < amount) return res.status(400).json({message: "Insufficient TBK Credits"});

  const tbkCredits = (credits - amount)?.toFixed(2);

  const updatedUser = await Users.update({tbkCredits}, {where: {id}});
  return res.status(200).json({success: true, updatedUser});
 } catch (error: any) {
  next(error);
 };
};

export default flightBookWithTBKCredits;