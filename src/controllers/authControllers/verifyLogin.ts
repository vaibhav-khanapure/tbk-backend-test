import type {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import Users, {type userTypes} from "../../database/tables/usersTable";

const verifyLogin = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {code, token, newAccount} = req.body;
  if(!code || !token) return res.status(400).json({message: "All fields are necessary"});

  jwt.verify(token, process.env.ACCESS_TOKEN_KEY as string, async (err: any, payload: any) => {
   if(err) return res.status(400).json({message: "Unauthorized"});

   const {phoneNumber, email, name, code: CODE, GSTNo, companyName, companyAddress} = payload;

   if(code !== CODE) return res.status(400).json({message: "The code you entered is wrong"});

   if(!email && !phoneNumber) return res.status(400).json({message: "Unauthorized"});

   if(!newAccount) {
    const user = await Users.findOne({where: {...(phoneNumber ? {phoneNumber} : {email})}});

    if(!user) return res.status(404).json({message: "No user found"});

    if (!user?.active) return res.status(400).json({message: "Please contact tbk to enable your account"});

    const {name, email: Email, id} = user;

    const token = jwt.sign(
     {name, email: Email, id},
     process.env.ACCESS_TOKEN_KEY as string,
    );

    return res.status(200).json({user, token});
   };

   const newUser = {name, email, phoneNumber, tbkCredits: 1000000} as userTypes;

   if(GSTNo) newUser.GSTNumber = GSTNo;
   if(companyAddress) newUser.GSTCompanyAddress = companyAddress;
   if(companyName) newUser.GSTCompanyName = companyName;

   const user = await Users.create(newUser);

   const {email: Email, id} = user;

   const token = jwt.sign(
    {name, email: Email, id},
    process.env.ACCESS_TOKEN_KEY as string,
   );

   return res.status(200).json({message: "Account created, please contact tbk to enable your account"});
//    return res.status(200).json({user, token});
  });
 } catch (error) {
  next(error);
 };
};

export default verifyLogin;