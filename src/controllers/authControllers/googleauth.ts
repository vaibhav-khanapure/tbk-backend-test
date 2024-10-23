import type {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import validateEmail from "../../utils/emailValidator";
import Users from "../../database/tables/usersTable";

const googleauth = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {name, email, newAccount, phoneNumber} = req.body;

  if(!name || !email) {
   return res.status(400).json({message: "name and email are required"});
  };

  if(!validateEmail(email)) {
   return res.status(400).json({message: "Invalid EmailId"});
  };

  if(!newAccount) {
   const user = await Users.findOne({ where: { emailId: email } });

   if (user) {
    const {emailId, id} = user;

    const token = jwt.sign(
     {id, name, emailId},
     process.env.ACCESS_TOKEN_KEY as string,
     {expiresIn: "90d"}
    )

    return res.status(200).json({token, user});
   };

   return res.status(200).json({isNewAccount: true});
  };

  if(!phoneNumber) return res.status(400).json({message: "Phone Number is required"});

  if(!Number(phoneNumber) || (Number(phoneNumber) && phoneNumber.length !== 10)) {
   return res.status(400).json({message: "Phone Number is required"});
  };

  const newUser = await Users.create({
   name,
   emailId: email,
   phoneNumber,
   tbkCredits: 1000000,
  });

  const {emailId, id} = newUser;

  const token = jwt.sign(
   {id, name, emailId},
   process.env.ACCESS_TOKEN_KEY as string,
   {expiresIn: "90d"},
  );

  return res.status(200).json({token, user: newUser});
 } catch (error) {
  next(error);
 };
};

export default googleauth;