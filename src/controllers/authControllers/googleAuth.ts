import "dotenv/config";
import type {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import validateEmail from "../../utils/emailValidator";
import validateContact from "../../utils/contactValidator";
import Users, {type UserAttributes } from "../../database/tables/usersTable";
import Discounts from "../../database/tables/discountsTable";
import Headlines from "../../database/tables/headlinesTable";
import { Op } from "sequelize";
import sequelize from "../../config/sql";

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
    attributes: {
     exclude: ["disableTicket", "created_at", "updated_at", "updatedByStaffId", "role", "deleted_at", "email_verified_at", "password", "remember_token",]
    },
    raw: true,
   });

   if (user) {
    if (!user?.active) return res.status(400).json({message: "Please contact tbk to enable your account"});

    const jwtData = {
     id: user?.id,
     name: user?.name,
     email: user?.email,
     sub: user?.id,
    } as Record<string, unknown>;

    if (user?.groupId) jwtData["groupId"] = user?.groupId;
    if (user?.hotelGroupId) jwtData["hotelGroupId"] = user?.hotelGroupId;

    const token = jwt.sign(jwtData, process.env.JWT_SECRET_KEY as string);

    const {active, id, groupId, hotelGroupId, ...userdata} = user;
    const userDetails = {...userdata} as unknown as Record<string, string>;

    Object.keys(userDetails)?.forEach(key => {
     if (userDetails?.[key] === null || typeof userDetails?.[key] === 'undefined') {
      delete userDetails?.[key]
     };
    });

    const headline = await Headlines.findOne({
     where: {
      [Op.or]: [
        { userId: id },
        { groupId: groupId },
        { type: 'top' }
      ]
     },
     attributes: ['name', 'description'],
     order: [
      [sequelize.literal(`CASE 
       WHEN "userId" = ${id} THEN 1
       WHEN "groupId" = ${groupId ?? null} THEN 2
       WHEN "type" = 'top' THEN 3
       ELSE 4 END`), 'ASC']
     ],
     raw: true,
    });

    return res.status(200).json({token, user: userDetails, headline});
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
   active: false,
  //  active: process.env.SERVER_URL === "https://tbkbackend.onrender.com" ? false : true
  } as UserAttributes;

  if (companyName) newUserDetails["GSTCompanyName"] = companyName;
  if (companyAddress) newUserDetails["GSTCompanyAddress"] = companyAddress;
  if (GSTNo) newUserDetails["GSTNumber"] = GSTNo;

  const exclude = ["disableTicket", "created_at", "updated_at", "role", "email_verified_at", "remember_token", "password", "deleted_at", "updatedByStaffId"];

  const [[newUser, created]] = await Promise.all([ 
   Users.findOrCreate({
    where: {phoneNumber},
    defaults: newUserDetails,
    attributes: {exclude},
    raw: true,
   }),
//    Discounts.findAll({ where: {isDefault: true, master: true}, raw: true }),
  ]);

  const getUser = newUser?.dataValues || newUser;

  const {id, created_at, updated_at, email_verified_at, remember_token, password, role, deleted_at, active, updatedByStaffId, disableTicket, ...userDetails} = getUser;

  const user = {...userDetails} as unknown as Record<string, string>;

  Object.keys(user)?.forEach(key => !user?.[key] && delete user?.[key]);

  if (!created) return res.status(400).json({message: "The Phone Number you provided already exists"});

//   const allDiscounts = discounts?.map(discount => ({
//    fareType: discount?.fareType,
//    discount: discount?.discount,
//    markup: discount?.markup,
//    userId: newUser?.id as number,
//    approved: true,
//   }));

//   await Discounts.bulkCreate(allDiscounts);

  const jwtData = {
   id, 
   name, 
   email,
   sub: id,
  } as Record<string, unknown>;

  if (getUser?.groupId) jwtData["groupId"] = getUser?.groupId;
  if (getUser?.hotelGroupId) jwtData["hotelGroupId"] = getUser?.hotelGroupId;

  const token = jwt.sign(jwtData, process.env.JWT_SECRET_KEY as string);

  return res.status(201).json({message: "Please contact tbk to enable your account"});
  // return res.status(201).json({token, user});
 } catch (error) {
  next(error);
 };
};

export default googleAuth;