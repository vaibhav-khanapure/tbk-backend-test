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
  let {name, email, phoneNumber, companyName = "", companyAddress = "", GSTNo = ""} = req.body;

  name = name?.trim();
  email = email?.trim();
  phoneNumber = phoneNumber?.trim();
  companyAddress = companyAddress?.trim();
  companyName = companyName?.trim();
  GSTNo = GSTNo?.trim();

  if(!name || !email || !phoneNumber) return res.status(400).json({ message : "All fields are required"});

  // validations
  if(name?.length < 3) return res.status(400).json({message: "Name must include atleast 3 characters"});

  if(!validateEmail(email)) return res.status(400).json({message: "The Email you entered is Invalid"});

  if(!validateContact(phoneNumber)) return res.status(400).json({message: "The Phone Number you Entered seems Invalid"});

  if(companyAddress && companyAddress?.length < 10) {
   return res.status(400).json({message: "Please enter valid Company Address"});
  };

  if(companyName && companyName?.length < 1) {
   return res.status(400).json({message: "Please Enter valid Company Name"}); 
  };

  if(GSTNo && GSTNo?.length < 10) return res.status(400).json({message: "Please Enter valid GST Number"}); 

  // checking if user exists
  const userExists = await Users.findOne({ where: {[Op.or]: [{ email }, { phoneNumber }]} });

  if(userExists) {
   if(userExists?.email === email) return res.status(400).json({message: "Email already exists"});
   if(userExists?.phoneNumber === phoneNumber) return res.status(400).json({message: "Phone Number already exists"});
  };

  const code = uuid(6, {capitalLetters: false, numbers: true});

  if(validateEmail(email)) {
   transporter.sendMail({
    from: '"Ticket Book Karo" <dhiraj@zendsoft.com>', // sender address
    to: email,
    subject: "Account creation OTP",
    text: "OTP for the registration of TicketBookKaro Account",
    html: `
     <h1>Please Enter the OTP below to verify your Account, This OTP is only valid for next 20 minutes</h1>
     <p>The OTP is: <b>${code}</b></p>
    `,
   });
  };

  const tokenData = {code, name, email, phoneNumber} as Record<string, string>;

  if(GSTNo) tokenData.GSTNo = GSTNo;
  if(companyAddress) tokenData.companyAddress = companyAddress;
  if(companyName) tokenData.companyName = companyName;

  const token = jwt.sign(tokenData, process.env.ACCESS_TOKEN_KEY as string, {expiresIn: "20m"});

  return res.status(200).json({token});
 } catch (error) {
  next(error);
 };
};

export default register;