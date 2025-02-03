import type {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import Users, {type userTypes} from "../../database/tables/usersTable";
import Discounts from "../../database/tables/discountsTable";

const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
 try {
  let {code = "", token = "", newAccount} = req.body;

  code = code?.trim();
  token = token?.trim();

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

   const newUser = {name, email, phoneNumber} as userTypes;

   if(GSTNo) newUser.GSTNumber = GSTNo;
   if(companyAddress) newUser.GSTCompanyAddress = companyAddress;
   if(companyName) newUser.GSTCompanyName = companyName;

   const [user, discounts] = await Promise.all([
    await Users.create(newUser),
    await Discounts.findAll({where: {isDefault: true, master: true}}),
   ]);

   if (!user) return res.status(400).json({message: "Unable to create user, Please try again later"});

   const allDiscounts = discounts?.map(discount => ({
    fareType: discount?.fareType,
    discount: discount?.discount,
    markup: discount?.markup,
    userId: user?.id as number,
   }));

   await Discounts.bulkCreate(allDiscounts);

   const {email: Email, id} = user;

   const userToken = jwt.sign(
    {name, email: Email, id},
    process.env.ACCESS_TOKEN_KEY as string,
   );

   return res.status(200).json({message: "Account created, please contact tbk to enable your account"});
  //  return res.status(200).json({user, token: userToken});
  });
 } catch (error) {
  next(error);
 };
};

export default verifyUser;