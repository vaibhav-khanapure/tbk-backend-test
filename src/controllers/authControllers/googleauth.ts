import type {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";
import validateEmail from "../../utils/emailValidator";
import generateRandomNumber from "../../utils/randomNumberGenerator";
import transporter from "../../config/email";

const googleauth = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {name, email, newAccount, phoneNumber} = req.body;

  console.log("REQUEST SUCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC")

  if(!name || !email) {
   return res.status(400).json({message: "name and email are required"});
  };

  if(!validateEmail(email)) {
   return res.status(400).json({message: "Invalid EmailId"});
  };

  if(!newAccount) {
   let user = await prisma.user.findUnique({ where: { emailId: email } });

   if (user) {
    const {emailId, id} = user;
 
    const token = jwt.sign(
     {id, name, emailId},
     process.env.ACCESS_TOKEN_KEY as string,
     {expiresIn: "90d"}
    );
 
    return res.status(200).json({token, user});
   };

   return res.status(200).json({message: "new account"});
  };

  if(!phoneNumber) return res.status(400).json({message: "Phone Number is required"});

  if(!Number(phoneNumber) || (Number(phoneNumber) && phoneNumber.length !== 10)) {
   return res.status(400).json({message: "Phone Number is required"});
  };

  let randomPassword = `name${generateRandomNumber(0,1000)}`;

//   const info = await transporter.sendMail({
//    from: '"Vinod Thapa 👻" <thapa@gmail.com>', // sender address
//    to: email, // list of receivers
//    subject: "Account creation", // Subject line
//    text: "Hello YT Thapa", // plain text body
//    html: `<b>Your password is ${randomPassword}</b>`, // html body
//   });

  const newUser = await prisma.user.create({
   data: {
    name,
    emailId: email,
    password: randomPassword,
    phoneNumber,
    tbkcredits: 1000000,
   }
  });

  const {emailId, id} = newUser;

  const token = jwt.sign(
   {id, name, emailId},
   process.env.ACCESS_TOKEN_KEY as string,
   {expiresIn: "90d"},
  );

  return res.status(200).json({token, user: newUser});
 } catch (error) {
  next(error);
 };
};

export default googleauth;