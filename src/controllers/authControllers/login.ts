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
   transporter.sendMail({
    from: '"Ticket Book Karo" <noreply@ticketbookkaro.com>', // sender address
    to: userInput, // list of receivers
    subject: "Account Verification OTP", // Subject line
    text: "code for verification of TicketBookKaro Account",
    html: `
     <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2a4d8f;">TBK Login OTP</h2>
      <p>Use the One-Time Password (OTP) below to securely log in to your TBK account:</p>
      <p style="font-size: 20px; margin: 20px 0;">
       <strong style="background:#f4f4f4; padding: 10px 20px; border-radius: 5px; display: inline-block; letter-spacing: 2px;">
        ${code}
       </strong>
      </p>
      <p>This OTP is valid for the next <strong>20 minutes</strong>. For your security, please do not share it with anyone.</p>
      <p style="margin-top: 30px;">Best Regards,<br><strong>The TBK Team</strong></p>
     </div>
    `,
   })
   .catch(() => {});
  };

  if (isPhoneValid()) {
   const msg = `Your OTP- One Time Password is ${code} to authenticate your login with TicketBookKaro Powered By mTalkz`;
   const encodedMsg = encodeURIComponent(msg);

   const PhoneNo = userInput?.split("-")?.join("");

   const URL = `${MTALKZ_API_URL}?apikey=${MTALKZ_API_KEY}&senderid=${MTALKZ_API_SENDER_ID}&number=${PhoneNo}&message=${encodedMsg}&format=json`;

   axios.get(URL).catch(() => {});
  };

  const data = {code} as Record<string, string>;
  if (isEmail) data["email"] = userInput;
  if (isPhoneValid()) data["phoneNumber"] = userInput;

  const token = jwt.sign(data, process.env.JWT_SECRET_KEY as string, {expiresIn: "20m"});
  return res.status(200).json({token});
 } catch (error) {
  next(error);
 };
};

export default login;