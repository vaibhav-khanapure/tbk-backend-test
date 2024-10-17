import type {Request, Response, NextFunction} from "express";
import Users from "../../database/tables/usersTable";

const updateTBKCredit = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {amount, email} = req.body;

  if (!email || !amount) {
   return res.status(400).json({ message: 'Email ID and amount are required' }); 
  };

  const user = await Users.findOne({where: {emailId: email}});

  if (!user) return res.status(404).json({ message: 'User not found' });

  // Ensure the user has enough credits
  if (user.tbkCredits < amount) {
   return res.status(400).json({ message: 'Insufficient TBK Credits' });
  };

  const updatedUser = await Users.update(
   {tbkCredits: user.tbkCredits - amount},
   {where: {emailId: email}}
  );

  return res.status(200).json({updatedUser});
 } catch (error) {
  next(error);
 };
};

export default updateTBKCredit;