import "dotenv/config";
import type {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import validateEmail from "../../utils/emailValidator";
import validateContact from "../../utils/contactValidator";
import Users from "../../database/tables/usersTable";

const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {name, email, newAccount, phoneNumber, companyName = "", companyAddress = "", GSTNo = ""} = req.body;

  if(!name || !email) return res.status(400).json({message: "name and email are required"});

  if(!validateEmail(email)) return res.status(400).json({message: "Invalid Email"});

  if(!newAccount) {
   const user = await Users.findOne({ where: { email } });

   if (user) {
    const {email, id} = user;
    const token = jwt.sign({id, name, email}, process.env.ACCESS_TOKEN_KEY as string,)
    return res.status(200).json({token, user});
   };

   return res.status(200).json({isNewAccount: true});
  };

  // check if phone number exists
  if (!phoneNumber) return res.status(400).json({message: "Phone Number is required"});

  if (!validateContact(phoneNumber)) {
   return res.status(400).json({message: "Invalid Phone Number"});
  };

  if(companyAddress && companyAddress?.length < 3) {
   return res.status(400).json({message: "Please enter valid Company Address"});
  };
 
  if(companyName && companyName?.length < 1) {
   return res.status(400).json({message: "Please Enter valid Company Name"}); 
  };

  if(GSTNo && GSTNo?.length < 10) {
   return res.status(400).json({message: "Please Enter valid GST Number"});
  };

  const [newUser, created] = await Users.findOrCreate({
   where: {phoneNumber},
   defaults: {name, email, phoneNumber, tbkCredits: 1000000},
  });

  if (!created) {
   return res.status(400).json({message: "The Phone Number you provided already exists"});
  };

  const {id} = newUser;

  const token = jwt.sign(
   {id, name, email},
   process.env.ACCESS_TOKEN_KEY as string,
  );

  return res.status(200).json({token, user: newUser});
 } catch (error) {
  next(error);
 };
};

export default googleAuth;