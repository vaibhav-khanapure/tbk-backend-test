import type {Request, Response, NextFunction} from "express";
import Users from "../../database/tables/usersTable";

const updateTBKCredits = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {id} = res.locals?.user;
  const {amount} = req.query as unknown as {amount: number};

  if (!amount) return res.status(400).json({message: 'Amount is required'});

  const user = await Users.findOne({where: {id}});
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Ensure the user has enough credits
  if (Number(user?.dataValues?.tbkCredits) < Number(amount)) return res.status(400).json({ message: 'Insufficient TBK Credits' });

  const updatedUser = await Users.update(
   {tbkCredits: user?.dataValues?.tbkCredits - amount},
   {where: {id}}
  );

  return res.status(200).json({updatedUser});
 } catch (error) {
  next(error);
 };
};

export default updateTBKCredits;