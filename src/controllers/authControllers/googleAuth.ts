import "dotenv/config";
import type {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import validateEmail from "../../utils/emailValidator";
import validateContact from "../../utils/contactValidator";
import Users, {type userTypes} from "../../database/tables/usersTable";
import Discounts from "../../database/tables/discountsTable";

const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
 try {
  let {name = "", email = "", newAccount, phoneNumber = "", companyName = "", companyAddress = "", GSTNo = ""} = req.body;

  name = name?.trim();
  email = email?.trim();
  phoneNumber = phoneNumber?.trim();
  companyName = companyName?.trim();
  companyAddress = companyAddress?.trim();
  GSTNo = GSTNo?.trim();

  if (!name || !email) return res.status(400).json({message: "Name and Email are required"});

  if (!validateEmail(email)) return res.status(400).json({message: "Invalid Email"});

  if (!newAccount) {
   const user = await Users.findOne({
    where: {email},
    attributes: {exclude: ["disableTicket", "createdAt", "updatedAt"]},
    raw: true,
   });

   if (user) {
    if (!user?.active) return res.status(400).json({message: "Please contact tbk to enable your account"});
    const token = jwt.sign({id: user?.id, name, email: user?.email}, process.env.ACCESS_TOKEN_KEY as string);
  
    const {active, id, ...userdata} = user;
    return res.status(200).json({token, user: userdata});
   };

   return res.status(200).json({isNewAccount: true});
  };

  // check if phone number exists
  if (!phoneNumber) return res.status(400).json({message: "Phone Number is required"});

  // validate contact
  const [countryCode, phone] = phoneNumber?.split("-");
  const isIndianPhone = countryCode === "91";

  if (isIndianPhone && !validateContact(phone)) {
   return res.status(400).json({message: "Invalid Phone Number"});
  };

  if (!isIndianPhone && (!Number(phone) || (Number(phone) && phone?.length < 8))) {
   return res.status(400).json({message: "Invalid Phone Number"});
  };

  if (companyAddress && companyAddress?.length < 3) {
   return res.status(400).json({message: "Company Address should contain atleast 3 characters"});
  };

  if (GSTNo) {
   if (GSTNo?.length !== 15) return res.status(400).json({message: "GST Number should be 15 digits long"});
   if (GSTNo?.includes(" ")) return res.status(400).json({message: "GST Number should not contain spaces"});
  };

  const newUserDetails = {
   name, 
   email, 
   phoneNumber,
   active: process.env.SERVER_URL === "https://tbkbackend.onrender.com" ? false : true
  } as userTypes;

  if (companyName) newUserDetails["GSTCompanyName"] = companyName;
  if (companyAddress) newUserDetails["GSTCompanyAddress"] = companyAddress;
  if (GSTNo) newUserDetails["GSTNumber"] = GSTNo;

  const [[newUser, created], discounts] = await Promise.all([ 
   Users.findOrCreate({
    where: {phoneNumber}, 
    defaults: newUserDetails,
    attributes: {exclude: ["disableTicket", "createdAt", "updatedAt"]},
    raw: true,
   }),
   Discounts.findAll({
    where: {isDefault: true, master: true},
    raw: true
   }),
  ]);

  const {createdAt, updatedAt, id, active, disableTicket, ...user} = newUser?.dataValues;

  if (!created) return res.status(400).json({message: "The Phone Number you provided already exists"});

  const allDiscounts = discounts?.map(discount => ({
   fareType: discount?.fareType,
   discount: discount?.discount,
   markup: discount?.markup,
   userId: newUser?.id as number,
  }));

  await Discounts.bulkCreate(allDiscounts);

  const token = jwt.sign({id, name, email}, process.env.ACCESS_TOKEN_KEY as string);
  // return res.status(201).json({message: "Please contact tbk to enable your account"});
  return res.status(201).json({token, user});
 } catch (error) {
  next(error);
 };
};

export default googleAuth;