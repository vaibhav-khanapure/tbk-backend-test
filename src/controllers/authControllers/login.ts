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
  const {userInput} = req.body;
  if (!userInput) return res.status(400).json({message: "Please provide Email or Phone Number"});

  if (!(validateContact(userInput) || validateEmail(userInput))) {
   return res.status(400).json({message: "Invalid Email or Phone Number"});
  };

  const user = await Users.findOne({
   where: {[userInput.includes('@') ? 'email' : 'phoneNumber']: userInput},
  });

  if(!user) {
   const message = `user not found with ${userInput.includes("@") ? `Email ${userInput}` : `Phone Number ${userInput}`}`;
   return res.status(404).json({message});
  };

  const code = uuid(6,{capitalLetters: false, numbers: true});

  if(validateEmail(userInput)) {
   transporter.sendMail({
    from: '"Ticket Book Karo" <dhiraj@zendsoft.com>', // sender address
    to: userInput, // list of receivers
    subject: "Account creation Code", // Subject line
    text: "code for verification of TicketBookKaro Account",
    html: `
     <h1>Please Enter the code below to verify your Account, This code is only valid for next 20 minutes</h1>
     <p>The code is: <b>${code}</b></p>
    `,
   });
  };

  if(validateContact(userInput)) {
   const msg = `Your OTP- One Time Password is ${code} to authenticate your login with TicketBookKaro Powered By mTalkz`;
   const encodedMsg = encodeURIComponent(msg);

   const URL = `${MTALKZ_API_URL}?apikey=${MTALKZ_API_KEY}&senderid=${MTALKZ_API_SENDER_ID}&number=${userInput}&message=${encodedMsg}&format=json`;

   axios.get(URL);
  };

  // for phone number
  const token = jwt.sign(
   {code, ...(validateEmail(userInput) ? {email: userInput} : {phoneNumber: userInput})},
   process.env.ACCESS_TOKEN_KEY as string,
   {expiresIn: "20m"}
  );

  return res.status(200).json({token});
 } catch (error) {
  next(error);
 };
};

export default login;