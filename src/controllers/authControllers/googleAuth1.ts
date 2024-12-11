import type {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import validateEmail from "../../utils/emailValidator";
import Users from "../../database/tables/usersTable";
import validateContact from "../../utils/contactValidator";

const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {name, email, newAccount, phoneNumber} = req.body;

  if(!name || !email) return res.status(400).json({message: "name and email are required"});

  if(!validateEmail(email)) return res.status(400).json({message: "Invalid Email"});

  if(!newAccount) {
   const user = await Users.findOne({ where: { email } });

   if (user) {
    const {email, id} = user;

    const token = jwt.sign(
     {id, name, email},
     process.env.ACCESS_TOKEN_KEY as string,
    )

    return res.status(200).json({token, user});
   };

   return res.status(200).json({isNewAccount: true});
  };

  // check if phone number exists
  if(!phoneNumber) return res.status(400).json({message: "Phone Number is required"});

  if(!validateContact(phoneNumber)) return res.status(400).json({message: "Invalid Phone Number"});

  const [newUser, created] = await Users.findOrCreate({
   where: { phoneNumber },
   defaults: {
    name,
    email,
    phoneNumber,
    tbkCredits: 1000000,
   },
  });

  if (!created) return res.status(400).json({message: "The Phone Number you provided already exists"});

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