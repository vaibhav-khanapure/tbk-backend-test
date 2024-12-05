import type {NextFunction, Request, Response} from "express";
import Users from "../../database/tables/usersTable";
import transporter from "../../config/email";
import jwt from "jsonwebtoken";
import uuid from "../../utils/uuid";
import validateContact from "../../utils/contactValidator";

const updatePhoneNumber = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {id: userId} = res.locals?.user;
  const {phone, step, otp, token} = req.body;
  if(!step) return res.status(400).json({message: "Please provide step number"});

  if(step === 1) {
   if(!phone) return res.status(400).json({message: "Please provide Phone Number"});
   if(!validateContact(phone)) return res.status(400).json({message: "Invalid Phone Number"});
   const code = uuid(6,{capitalLetters: false, numbers: true});

   // add here the code for sending sms to contact

   const token = jwt.sign(
    {code, phone},
    process.env.ACCESS_TOKEN_KEY as string,
    {expiresIn: "20m"}
   );

   return res.status(200).json({token});
  };

  if(step === 2) {
   if(!otp || !token) return res.status(400).json({message: "All fields are required"});

   jwt.verify(token, process.env.ACCESS_TOKEN_KEY as string, async (err: any, payload: any) => {
    if(err) return res.status(400).json({message: "Invalid Data"});

    const {code, phone} = payload;
    if(code !== otp) return res.status(400).json({message: "The OTP you entered is wrong"});
    await Users.update({phoneNumber: phone}, {where: {id: userId}});
    return res.status(200).json({phone});
   });
  };
 } catch (error) {
  next(error);
 };
};

export default updatePhoneNumber;