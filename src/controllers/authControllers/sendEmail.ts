import type {NextFunction, Request, Response} from "express";
import nodemailer from "nodemailer";

const sendEmail = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const testAccount = await nodemailer.createTestAccount();

  // connect with the smtp
  const transporter = nodemailer.createTransport({
   host: "smtp.ethereal.email",
   port: 587,
   auth: {
    user: 'orrin.harvey99@ethereal.email',
    pass: 'sE1yXY7dZP8jK5esZx'
   }
  });
 
  const info = await transporter.sendMail({
   from: '"Vinod Thapa 👻" <thapa@gmail.com>', // sender address
   to: "harshkhichi1098@gmail.com", // list of receivers
   subject: "Hello Thapa", // Subject line
   text: "Hello YT Thapa", // plain text body
   html: "<b>Hello YT Thapa</b>", // html body
  });
 
  console.log("Message sent: %s", info.messageId);
  return res.status(200).json(info);
 } catch (error) {
  next(error);  
 };
};

export default sendEmail;