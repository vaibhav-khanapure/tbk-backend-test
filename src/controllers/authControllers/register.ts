import "dotenv/config";
import type {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import validateEmail from "../../utils/emailValidator";
import validateContact from "../../utils/contactValidator";
import uuid from "../../utils/uuid";
import transporter from "../../config/email";
import Users from "../../database/tables/usersTable";
import { Op } from "sequelize";
import axios from "axios";

const {MTALKZ_API_URL, MTALKZ_API_KEY, MTALKZ_API_SENDER_ID} = process.env;

const register = async (req: Request, res: Response, next: NextFunction)=>{
 try {
  let {name, email, phoneNumber, companyName = "", companyAddress = "", GSTNo = ""} = req.body;

  name = name?.split(" ").filter(Boolean)?.join(" ")?.trim();
  email = email?.trim();
  phoneNumber = phoneNumber?.trim();
  companyAddress = companyAddress?.trim();
  companyName = companyName?.trim();
  GSTNo = GSTNo?.trim();

  if (!name || !email || !phoneNumber) return res.status(400).json({ message : "All fields are required"});

  // validations
  if (name?.length < 3) return res.status(400).json({message: "Name must include atleast 3 characters"});

  if (!validateEmail(email)) return res.status(400).json({message: "Invalid Email Provided"});

  // contact validation
  const [countryCode, phone] = phoneNumber?.split("-");
  const isIndianPhone = countryCode === "91";

  if (isIndianPhone && !validateContact(phone)) {
   return res.status(400).json({message: "Invalid Phone Number"});
  };

  if (!isIndianPhone && (!Number(phone) || (Number(phone) && phone?.length < 8))) {
   return res.status(400).json({message: "Invalid Phone Number"});
  };

  if (companyAddress && companyAddress?.length < 3) {
   return res.status(400).json({message: "Please Provide a valid Company Address"});
  };

  if (GSTNo) {
   if (GSTNo?.length !== 15) return res.status(400).json({message: "GST Number should be 15 digits long"});
   if (GSTNo?.includes(" ")) return res.status(400).json({message: "GST Number should not contain spaces"});
  };

  // checking if user exists
  const userExists = await Users.findOne({ 
   where: {[Op.or]: [{email}, {phoneNumber}]},
   attributes: ["email", "phoneNumber"],
   raw: true,
  });

  if (userExists) {
   if (userExists?.email === email) return res.status(400).json({message: "The Account with this Email already exists"});
   if (userExists?.phoneNumber === phoneNumber) {
    return res.status(400).json({message: "The Account with this Phone Number already exists"});
   };
  };

  const code = uuid(6, {capitalLetters: false, numbers: true});

  // Sending OTP to Email
  if (validateEmail(email)) {
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

  // OTP for Phone Number
  const msg = `Your OTP- One Time Password is ${code} to authenticate your login with TicketBookKaro Powered By mTalkz`;
  const encodedMsg = encodeURIComponent(msg);

  const PhoneNo = phoneNumber?.split("-")?.join("");

  const URL = `${MTALKZ_API_URL}?apikey=${MTALKZ_API_KEY}&senderid=${MTALKZ_API_SENDER_ID}&number=${PhoneNo}&message=${encodedMsg}&format=json`;

  axios.get(URL);

  const tokenData = {code, name, email, phoneNumber} as Record<string, string>;

  if (GSTNo) tokenData["GSTNo"] = GSTNo;
  if (companyAddress) tokenData["companyAddress"] = companyAddress;
  if (companyName) tokenData["companyName"] = companyName;

  const token = jwt.sign(tokenData, process.env.ACCESS_TOKEN_KEY as string, {expiresIn: "20m"});
  return res.status(200).json({token});
 } catch (error) {
  console.log("REGISTER error ==============================>", error);  
  next(error);
 };
};

export default register;