import type {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../../config/prisma";
import validateEmail from "../../utils/emailValidator";

const login = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {userInput, password} = req.body;

  if (!userInput || !password) {
   return res.status(400)
   .json({message: "Please provide Email or Phone Number along with password"});
  };

  if(
   (userInput.length < 10) || 
   (userInput.length === 10 && !Number(userInput)) || 
   (userInput.length >= 10 && !validateEmail(userInput))
  ) {
   return res.status(400).json({message: "Invalid Email or Phone Number"});
  };

  if(password.length < 6) {
   return res.status(400).json({message: "Password must be atleast 6 characters long"});
  };

  if(password.includes(" ")) {
   return res.status(400).json({message: "Password must not include spaces"});
  };

  const user = await prisma.user.findUnique({ 
   where: {
    ...(userInput.includes('@') ? { emailId: userInput } : { phoneNumber: userInput })
   },
  });

  if(!user) return res.status(404).json({ message:"Invalid Email or phone Number" });

  const checkPwd = await bcrypt.compare(user?.password, password);

  if(!checkPwd) {
   return res.status(400).json({message: "Incorrect Email or Phone Number or password"});
  };

  const {name, emailId, id} = user;

  const token = jwt.sign(
   {id, name, emailId},
   process.env.ACCESS_TOKEN_KEY as string,
   {expiresIn: "90d"}
  );

  return res.status(200).json({token, user});
 } catch (error) {
  next(error);
 };
};

export default login;