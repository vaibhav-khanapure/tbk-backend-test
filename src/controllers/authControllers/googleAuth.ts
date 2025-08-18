import "dotenv/config";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import validateEmail from "../../utils/emailValidator";
import validateContact from "../../utils/contactValidator";
import Users, { type UserAttributes } from "../../database/tables/usersTable";
import Discounts from "../../database/tables/discountsTable";
import Headlines from "../../database/tables/headlinesTable";
import { Op } from "sequelize";
import sequelize from "../../config/sql";
import transporter from "../../config/email";

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
   const [user, headlines] = await Promise.all([
    Users.findOne({
     where: {email},
     attributes: {
      exclude: ["disableTicket", "created_at", "updated_at", "updatedByStaffId", "role", "deleted_at", "email_verified_at", "password", "remember_token",]
     },
     raw: true,
    }),
    Headlines.findAll({
     where: { type: { [Op.in]: ['flight', 'hotel'] } },
     attributes: ['name', 'description', 'type'],
     raw: true
    })
   ]);

   if (!user) return res.status(200).json({isNewAccount: true});

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
      {
       [Op.and]: [
        { userId: id },
        { type: 'top' }
       ]
      },
      {
       [Op.and]: [
        { groupId },
        { type: 'top' }
       ]
      }
     ]
    },
    attributes: ['name', 'description'],
    order: [
     [sequelize.literal(`CASE 
      WHEN "userId" = ${id} AND "type" = 'top' THEN 1
      WHEN "groupId" = ${user?.groupId ?? null} AND "type" = 'top' THEN 2
      ELSE 3 END`), 'ASC']
    ],
    raw: true,
   });

   const data = {
    user: userDetails,
    headlines,
    token
   } as Record<string, unknown>;

   if (headline) data['headline'] = headline;

   return res.status(200).json(data);
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
   active: true,
  //  active: process.env.SERVER_URL === "https://tbkbackend.onrender.com" ? false : true
  } as UserAttributes;

  if (companyName) newUserDetails["GSTCompanyName"] = companyName;
  if (companyAddress) newUserDetails["GSTCompanyAddress"] = companyAddress;
  if (GSTNo) newUserDetails["GSTNumber"] = GSTNo;

  const exclude = ["disableTicket", "created_at", "updated_at", "role", "email_verified_at", "remember_token", "password", "deleted_at", "updatedByStaffId"];

  const [[newUser, created], headlines] = await Promise.all([ 
   Users.findOrCreate({
    where: {phoneNumber},
    defaults: newUserDetails,
    attributes: {exclude},
    raw: true,
   }),
   Headlines.findAll({
    where: { type: { [Op.in]: ['flight', 'hotel'] } },
    attributes: ['name', 'description', 'type'],
    raw: true
   })
   // Discounts.findAll({ where: {isDefault: true, master: true}, raw: true }),
  ]);

  const getUser = newUser?.dataValues || newUser;

  const {id, created_at, updated_at, email_verified_at, remember_token, password, role, deleted_at, active, updatedByStaffId, disableTicket, ...userDetails} = getUser;

  const user = {...userDetails} as unknown as Record<string, string>;

  Object.keys(user)?.forEach(key => {
   if (user?.[key] === null || typeof user?.[key] === 'undefined') delete user?.[key];
  });

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

  const headline = await Headlines.findOne({
   where: {
    [Op.or]: [
     {
      [Op.and]: [
       { userId: id },
       { type: 'top' }
      ]
     },
     {
      [Op.and]: [
       { groupId: user?.groupId },
       { type: 'top' }
      ]
     }
    ]
   },
   attributes: ['name', 'description'],
   order: [
    [sequelize.literal(`CASE 
      WHEN "userId" = ${id} AND "type" = 'top' THEN 1
      WHEN "groupId" = ${user?.groupId ?? null} AND "type" = 'top' THEN 2
      ELSE 3 END`), 'ASC']
   ],
   raw: true,
  });

  const html = `
   <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #2a4d8f;">Welcome to Ticket Book Karo (TBK)!</h2>
    <p>Hi there,</p>
    <p>Thank you for choosing <strong>TBK</strong>. Your account has been successfully created 🎉</p>
    <p>
      Your TBK account is now active and ready to use. From today, you can enjoy a smarter, faster, and more reliable way to manage your corporate travel. 
      With TBK, you can streamline bookings, access exclusive deals, and benefit from travel solutions tailored to your business needs.
    </p>
    <p>
      Start exploring your new account and experience seamless travel management like never before.
    </p>
    <h4 style="margin-top: 20px; color: #2a4d8f;">We look forward to being your trusted travel partner!</h4>
    <p style="margin-top: 30px;">Best Regards,<br><strong>The TBK Team</strong></p>
   </div>
  `;

  transporter.sendMail({
   from: '"Ticket Book Karo" <noreply@ticketbookkaro.com>', // sender address
   to: email,
   subject: "TBK Account Creation Success",
   text: "Account Created for TBK",
   html,
  }).catch(() => {});

  const data = {
   user,
   headlines,
   token
  } as Record<string, unknown>;

  if (headline) data['headline'] = headline;

  // return res.status(201).json({message: "Please contact tbk to enable your account"});
  return res.status(201).json(data);
 } catch (error) {
  next(error);
 };
};

export default googleAuth;