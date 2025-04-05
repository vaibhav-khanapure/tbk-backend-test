import "dotenv/config";
import type {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import validateEmail from "../../utils/emailValidator";
import validateContact from "../../utils/contactValidator";
import transporter from "../../config/email";
import uuid from "../../utils/uuid";
import Users from "../../database/tables/usersTable";
import axios from "axios";

const {MTALKZ_API_URL, MTALKZ_API_KEY, MTALKZ_API_SENDER_ID} = process.env;

const login = async (req: Request, res: Response, next: NextFunction) => {
 try {
  let userInput = (req.body?.userInput || "")?.trim();

  if (!userInput) return res.status(400).json({message: "Please provide Email or Phone Number"});

  const isEmail = validateEmail(userInput);

  const isPhoneValid = () => {
   if (isEmail) return false;

   const [countryCode, phone] = userInput?.split("-");
   const isIndianPhone = countryCode === "91";

   if (isIndianPhone) return validateContact(phone)
   else {
    if (!Number(phone)) return false;
    if (phone?.length < 8) return false;
    return true;
   };
  };

  if (!isEmail && !isPhoneValid()) {
   if (!isEmail) return res.status(400).json({message: "Invalid Email"});
   if (!isPhoneValid()) return res.status(400).json({message: "Invalid Phone Number"});
  };

  const query = {} as Record<string , string>;

  if (isEmail) query["email"] = userInput
  if (isPhoneValid()) query["phoneNumber"] = userInput;

  const user = await Users.findOne({where: query, attributes: ["active"], raw: true});

  if (!user) {
   let message = "";

   if (isEmail) message = `User not found with Email ${userInput}`
   else {
    const [countryCode, phone] = userInput?.split("-");
    message = `User not found with Phone Number +${countryCode} ${phone}`
   };

   return res.status(404).json({message});
  };

  if (!user?.active) return res.status(400).json({message: "Please contact tbk to enable your Account"});

  const code = uuid(6, {capitalLetters: false, numbers: true});

  if (isEmail) {
   console.log("IS EMAIL") 

   transporter.sendMail({
    from: '"Ticket Book Karo" <noreply@ticketbookkaro.com>', // sender address
    to: userInput, // list of receivers
    subject: "Account Verification OTP", // Subject line
    text: "code for verification of TicketBookKaro Account",
    html: `
     <h1>Please Enter the OTP below to verify your Account, The OTP is only valid for next 20 minutes</h1>
     <p>The OTP is: <b>${code}</b></p>
    `,
   })
   .catch(err => console.error("Login Send OTP to Mail Error:::", err));
  };

  if (isPhoneValid()) {
   const msg = `Your OTP- One Time Password is ${code} to authenticate your login with TicketBookKaro Powered By mTalkz`;
   const encodedMsg = encodeURIComponent(msg);

   const PhoneNo = userInput?.split("-")?.join("");

   const URL = `${MTALKZ_API_URL}?apikey=${MTALKZ_API_KEY}&senderid=${MTALKZ_API_SENDER_ID}&number=${PhoneNo}&message=${encodedMsg}&format=json`;

   axios.get(URL).catch(err => console.error("Login Send OTP to Phone Number Error:::", err));;
  };

  const data = {code} as Record<string, string>;
  if (isEmail) data["email"] = userInput;
  if (isPhoneValid()) data["phoneNumber"] = userInput;

  const token = jwt.sign(data, process.env.ACCESS_TOKEN_KEY as string, {expiresIn: "20m"});
  return res.status(200).json({token});
 } catch (error) {
  next(error);
 };
};

export default login;