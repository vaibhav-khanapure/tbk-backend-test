import type {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import validateEmail from "../../utils/emailValidator";
import validateContact from "../../utils/contactValidator";
import uuid from "../../utils/uuid";
import transporter from "../../config/email";
import Users from "../../database/tables/usersTable";
import { Op } from "sequelize";

const register = async (req: Request, res: Response, next: NextFunction)=>{
 try {
  let {name, email, phoneNumber} = req.body;

  name = name.trim();
  email = email.trim();
  phoneNumber = phoneNumber.trim();

  if(!name || !email || !phoneNumber) return res.status(400).json({ message : "All fields are required"});

  if(name?.length < 3) return res.status(400).json({message: "Name must include atleast 3 characters"});

  if(!validateEmail(email)) return res.status(400).json({message: "Email is Invalid"});

  if(!validateContact(phoneNumber)) return res.status(400).json({message: "Invalid Phone Number"});

  const userExists = await Users.findOne({ where: {[Op.or]: [{ email }, { phoneNumber }]} });

  if(userExists) {
   if(userExists?.email === email) return res.status(400).json({message: "Email already exists"});
   if(userExists?.phoneNumber === phoneNumber) return res.status(400).json({message: "Phone Number already exists"});
  };

  const code = uuid(6, {capitalLetters: false, numbers: true});

  if(validateEmail(email)) {
   transporter.sendMail({
    from: '"Ticket Book Karo',
    to: email,
    subject: "Account creation Code",
    text: "code for the registration of TicketBookKaro Account",
    html: `
     <h1>Please Enter the code below to verify your Account, This code is only valid for next 20 minutes</h1>
     <p>The code is: <b>${code}</b></p>
    `,
   });
  };

  const token = jwt.sign(
   {code, name, email: email, phoneNumber},
   process.env.ACCESS_TOKEN_KEY as string,
   {expiresIn: "20m"}
  );

  return res.status(200).json({token});
 } catch (error) {
  next(error);
 };
};

export default register;