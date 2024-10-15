import type {NextFunction, Request, Response} from "express"
import prisma from "../../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validateEmail from "../../utils/emailValidator";

const register = async (req: Request, res: Response, next: NextFunction)=>{
 try {
  let {name, emailId, password, phoneNumber} = req.body;

  name = name.trim();
  emailId = emailId.trim();
  password = password.trim();
  phoneNumber = phoneNumber.trim();

  if(!name || !emailId || !password || !phoneNumber){
   return res.status(400).json({ message : "All fields are required"});
  };

  if(name.length < 3) {
   return res.status(400).json({message: "Name must include atleast 3 characters"});
  };

  if(!validateEmail(emailId)) {
   return res.status(400).json({message: "Invalid is Email"});
  };

  if(password.length < 6) {
   return res.status(400).json({message: "password must include atleast 3 characters"});
  };

  if(password.includes(" ")) {
   return res.status(400).json({message: "password should not include spaces"}); 
  };

  if(!Number(phoneNumber) || phoneNumber.length !== 10) {
   return res.status(400).json({message: "Invalid Phone Number"}); 
  };

  const userExists = await prisma.user.findUnique({ where: {
   OR: [ {emailId}, {phoneNumber} ] 
  }} as any);

  if(userExists) return res.status(400).json({message : "User Already Exists"});

  password = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
   data: {
    name,
    emailId,
    password,
    phoneNumber,
    tbkcredits:1000000,
   },
  });

//   const getUser = await prisma.user.findUnique({ where: {emailId}, select: {id: true} });

  const {id} = user;

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

export default register;