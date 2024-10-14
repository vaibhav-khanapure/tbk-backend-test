import type {NextFunction, Request, Response} from "express";
import prisma from "../../config/prisma";

const fetchUserData = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {emailId} = req.query;

  // Ensure emailId is provided
  if(!emailId) return res.status(400).json({ message: 'Email ID is required' });

  // Fetch the user based on the emailId
  const user = await prisma.user.findUnique({ where: { emailId }});

  // Check if user exists
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Return the user data
  return res.status(200).json({ user });
 } catch (error) {
  next(error);
 };
};

export default fetchUserData;