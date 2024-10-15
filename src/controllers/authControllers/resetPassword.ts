import type {NextFunction, Request, Response} from "express";
import prisma from "../../config/prisma";
import validateEmail from "../../utils/emailValidator";
import bcrypt from "bcrypt";

const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
 try {
  let {password, userInput} = req.body;

  if (!userInput || !password) {
   return res.status(400)
   .json({message: "Please provide Email Id or Phone Number along with the password"});
  };

  if(
   (userInput.length < 10) || 
   (userInput.length === 10 && !Number(userInput)) || 
   (userInput.length >= 10 && !validateEmail(userInput))
  ) {
   return res.status(400).json({message: "Invalid Email or Phone Number"});
  };

  if(password.length < 6) {
   return res.status(400).json({message: "Password must be 6 characters long"}) 
  };

  if(password.includes(" ")) {
   return res.status(400).json({message: "Password mshould not include spaces"}); 
  };

  password = await bcrypt.hash(password, 10);

  await prisma.user.update({ 
   where: { ...(userInput.includes('@') ? { emailId: userInput } : { phoneNumber: userInput }) },
   data: { password }
  });

  return res.status(200).json({success: true});
 } catch (error) {
  next(error);
 };
};

export default resetPassword;