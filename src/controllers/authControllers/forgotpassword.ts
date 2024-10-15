import type {NextFunction, Request, Response} from "express";
import prisma from "../../config/prisma";
import validateEmail from "../../utils/emailValidator";
import uuid from "../../utils/uuid";
import transporter from "../../config/email";

const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {userInput} = req.body;

  if (!userInput) {
   return res.status(400)
   .json({message: "Please provide Email Id or Phone Number"});
  };

  if(
   (userInput.length < 10) || 
   (userInput.length === 10 && !Number(userInput)) || 
   (userInput.length >= 10 && !validateEmail(userInput))
  ) {
   return res.status(400).json({message: "Invalid Email or Phone Number"});
  };

  const user = await prisma.user.findUnique({ 
   where: {
    ...(userInput.includes('@') ? { emailId: userInput } : { phoneNumber: userInput })
   },
  });

  if(!user) return res.status(404).json({ message: "Invalid Email or phone Number" });

  const code = uuid(6);

  if(validateEmail(userInput)) {
//    const info = await transporter.sendMail({
//     from: '"Vinod Thapa 👻" <thapa@gmail.com>', // sender address
//     to: userInput, // list of receivers
//     subject: "Account creation", // Subject line
//     text: "Hello YT Thapa", // plain text body
//     html: `<b>The code is ${code}</b>`, // html body
//    });

   return res.status(200).json({code, to: "email"});
  } else {
   return res.status(200).json({code, to: "phone"});
  }
 } catch (error) {
  next(error);
 };
};

export default forgotPassword;