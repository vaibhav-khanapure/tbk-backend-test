import prisma from "../../config/prisma";
import type {Request, Response, NextFunction} from "express";

const updateTBKCredit = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {amount, email} = req.body;

  if (!email || !amount)
   return res.status(400).json({ message: 'Email ID and amount are required' });

  // Fetch the user based on the email
  const user = await prisma.user.findUnique({
   where: {emailId: email} // Ensure this is correct and passed as string
  });

  if (!user) return res.status(404).json({ message: 'User not found' });

  // Ensure the user has enough credits
  if (user.tbkcredits < amount) {
   return res.status(400).json({ message: 'Insufficient TBK Credits' });
  };

  // Deduct the amount from tbkcredits
  const updatedUser = await prisma.user.update({
   where: { emailId: email },
   data: {
    tbkcredits: {
     decrement: amount // Deducting the amount
    }
   }
  });

  return res.status(200).json({ updatedUser });
 } catch (error) {
  next(error);
 };
};

export default updateTBKCredit;