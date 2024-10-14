import type {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";
import validateEmail from "../../utils/emailValidator";

const googleauth = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {name, email} = req.body;

  if (!name || !email) {
   return res.status(400)
   .json({message: "Please provide Email along with name"});
  };

  if(!validateEmail(email)) {
   return res.status(400).json({message: "Invalid EmailId"});
  };

  let user = await prisma.user.findUnique({ 
   where: { emailId: email },
  });

  if(!user) {
   user = await prisma.user.create({
    data: {
     name,
     emailId: email,
     password: "12343434888",
     phoneNumber: "2637626238",
     tbkcredits: 1000000,
    }
   });
  };

  const {emailId, id} = user;

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

export default googleauth;