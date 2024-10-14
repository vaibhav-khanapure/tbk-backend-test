import type {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";
import validateEmail from "../../utils/emailValidator";

const login = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {value} = req.body;

  if (!value){
   return res.status(400).json({ message: "Please provide email or Phone Number" });
  }; 

  if((value.length < 10) || (value.length === 10 && !Number(value)) || (value.length > 10 && !validateEmail(value))) {
    return res.status(400).json({message: "Invalid Email or Phone Number"});
  };

  const user = await prisma.user.findUnique(  { 
   where:{
    ...(value.includes('@') ? { emailId: value } : { phoneNumber: value })
   },
  });

  if(!user) return res.status(404).json({ message:"Invalid Email or phone Number" });

  const {name, email, id} = user;

  const token = jwt.sign(
   {id, name, email},
   process.env.ACCESS_TOKEN_KEY as string,
   {expiresIn: "1d"}
  );

  return res.status(200).json({token, user}) 
 } catch (error) {
  next(error);
 };
};

export default login;