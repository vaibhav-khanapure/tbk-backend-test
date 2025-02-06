import "dotenv/config";
import type {NextFunction, Request, Response} from "express";
import Users from "../../database/tables/usersTable";
import jwt from "jsonwebtoken";
import uuid from "../../utils/uuid";
import validateContact from "../../utils/contactValidator";
import axios from "axios";

const {MTALKZ_API_URL, MTALKZ_API_KEY, MTALKZ_API_SENDER_ID} = process.env;

const updatePhoneNumber = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res.locals?.user?.id;

  if (!userId) return res.status(401).json({message: "Unauthorized"});

  const {phone, step, otp, token} = req.body;

  if (!step) return res.status(400).json({message: "Please provide step number"});

  if (step === 1) {
   if (!phone) return res.status(400).json({message: "Please provide Phone Number"});

   const [countryCode, phoneNumber] = phone.split("-");

   const isIndianPhone = countryCode === "91";

   if (isIndianPhone && !validateContact(phoneNumber)) {
    return res.status(400).json({message: "Invalid Phone Number"});
   };

   if (!isIndianPhone && (!Number(phoneNumber) || (Number(phoneNumber) && phoneNumber?.length < 8))) {
    return res.status(400).json({message: "Invalid Phone Number"});
   };

   const code = uuid(6,{capitalLetters: false, numbers: true});
   const msg = `Your OTP- One Time Password is ${code} to authenticate your login with TicketBookKaro Powered By mTalkz`;
   const encodedMsg = encodeURIComponent(msg);

   const PhoneNo = phone?.split("-").join("");

   const URL = `${MTALKZ_API_URL}?apikey=${MTALKZ_API_KEY}&senderid=${MTALKZ_API_SENDER_ID}&number=${PhoneNo}&message=${encodedMsg}&format=json`;

   axios.get(URL);

   const token = jwt.sign(
    {code, phone},
    process.env.ACCESS_TOKEN_KEY as string,
    {expiresIn: "20m"}
   );

   return res.status(200).json({token});
  };

  if (step === 2) {
   if (!otp || !token) return res.status(400).json({message: "All fields are required"});

   jwt.verify(token, process.env.ACCESS_TOKEN_KEY as string, async (err: any, payload: any) => {
    if (err) return res.status(400).json({message: "Invalid Data"});

    const {code, phone} = payload;

    if (code !== otp) return res.status(400).json({message: "The OTP you entered is wrong"});

    await Users.update({phoneNumber: phone}, {where: {id: userId}});

    return res.status(200).json({phone});
   });
  };
 } catch (error) {
  next(error);
 };
};

export default updatePhoneNumber;