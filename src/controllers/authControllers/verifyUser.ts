import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import Users, { type UserAttributes } from "../../database/tables/usersTable";
import transporter from "../../config/email";
import Headlines from "../../database/tables/headlinesTable";
import { Op } from "sequelize";
import sequelize from "../../config/sql";
import Discounts from "../../database/tables/discountsTable";
import HotelDiscounts from "../../database/tables/hotelDiscountsTable";

const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
 try {
  let {code = "", token = "", newAccount} = req.body;

  code = code?.trim();
  token = token?.trim();

  if (!code || !token) return res.status(400).json({message: "All fields are necessary"});

  jwt.verify(token, process.env.JWT_SECRET_KEY as string, async (err: any, payload: any) => {
   if (err) return res.status(400).json({message: "Unauthorized"});

   const {phoneNumber, email, name, code: CODE, GSTNo, companyName, companyAddress} = payload;

   if (code !== CODE) return res.status(400).json({message: "The code you entered is wrong"});

   if (!email && !phoneNumber) return res.status(400).json({message: "Unauthorized"});

   if (!newAccount) {
    const exclude = [
     "disableTicket", "created_at", "updated_at", "role", "email_verified_at", "remember_token", "password", "deleted_at", "updatedByStaffId"
    ];

    const [user, headlines] = await Promise.all([
     Users.findOne({
      where: {...(phoneNumber ? {phoneNumber} : {email})},
      attributes: {exclude},
      raw: true,
     }),
     Headlines.findAll({
      where: { type: { [Op.in]: ['flight', 'hotel'] } },
      attributes: ['name', 'description', 'type'],
      raw: true
     })
    ]);

    if (!user) return res.status(404).json({message: "No user found"});
    if (!user?.active) return res.status(400).json({message: "Please contact tbk to enable your Account"});

    const {id, active, groupId, hotelGroupId, ...userdata} = user;
    const userDetails = {...userdata} as unknown as Record<string, string>;

    Object.keys(userDetails)?.forEach(key => {
     if (userDetails?.[key] === null || typeof userDetails?.[key] === 'undefined') {
      delete userDetails?.[key]
     };
    });

    const jwtData = {
     id,
     name: user?.name,
     email: user?.email,
     sub: id,
    } as Record<string, unknown>;
  
    if (groupId) jwtData["groupId"] = groupId;
    if (hotelGroupId) jwtData["hotelGroupId"] = hotelGroupId;

    const token = jwt.sign(jwtData, process.env.JWT_SECRET_KEY as string);

    const [headline, flightDiscounts, hotelDiscounts] = await Promise.all([
     Headlines.findOne({
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
     }),
     ...(groupId ? [
      Discounts.findAll({
       where: {groupId, approved: true},
       attributes: ["fareType", "discount", "markup", "coins", "coinsValueType"],
       raw: true
      })
     ]  : []),
     ...(hotelGroupId ? [
      HotelDiscounts.findAll({
       where: {hotelGroupId},
       attributes: ["minPrice", "maxPrice", "discount", "coins", "markup", "discountValueType", "markupValueType", "coinsValueType"],
       raw: true,
      })
     ]: [])
    ]);

    const data = {
     user: userDetails,
     headlines,
     token,
     flightDiscounts,
     hotelDiscounts
    } as Record<string, unknown>;

    if (headline) data['headline'] = headline;

    return res.status(200).json(data);
   };

   const newUser = {
    name,
    email,
    phoneNumber,
    active: true,
    // active: process.env.SERVER_URL === "https://tbkbackend.onrender.com" ? false : true
   } as UserAttributes;

   if (GSTNo) newUser["GSTNumber"] = GSTNo;
   if (companyAddress) newUser["GSTCompanyAddress"] = companyAddress;
   if (companyName) newUser["GSTCompanyName"] = companyName;

   const [user, headlines] = await Promise.all([
    Users.create(newUser),
    Headlines.findAll({
     where: { type: { [Op.in]: ['flight', 'hotel'] } },
     attributes: ['name', 'description', 'type'],
     raw: true
    })
    // await Discounts.findAll({where: {isDefault: true, master: true}, raw: true}),
   ]);

   if (!user) return res.status(400).json({message: "Unable to create user, Please try again later"});

  //  const allDiscounts = discounts?.map(discount => ({
  //   fareType: discount?.fareType,
  //   discount: discount?.discount,
  //   markup: discount?.markup,
  //   userId: user?.id as number,
  //   approved: true,
  //  }));

  //  await Discounts.bulkCreate(allDiscounts);

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

  //  const newHTML = `
  //   <div>
  //    <h2>New Account Verification Request!</h2>
  //    <p>A new user with name ${name} has signed up and waiting for verification.</p>
  //    <p>The Email is ${email}</p>
  //    <p>The Phone Number is ${phoneNumber}</p>
  //   </div>
  //  `;

   transporter.sendMail({
    from: '"Ticket Book Karo" <noreply@ticketbookkaro.com>', // sender address
    to: email,
    subject: "TBK Account Creation Success",
    text: "Account Created for TBK",
    html,
   }).catch(() => {});

  //  transporter.sendMail({
  //   from: '"Ticket Book Karo" <noreply@ticketbookkaro.com>', // sender address
  //   to: process.env.TBK_ADMIN_MAIL,
  //   subject: "TBK Account Verification Request",
  //   text: "TBK Account Verification Request",
  //   html: newHTML,
  //  }).catch(() => {});

   const jwtData = {
    id: user?.id,
    name,
    email: user?.email,
    sub: user?.id,
   } as Record<string, unknown>;

   if (user?.groupId) jwtData["groupId"] = user?.groupId;
   if (user?.hotelGroupId) jwtData["hotelGroupId"] = user?.hotelGroupId;

   const userToken = jwt.sign(jwtData, process.env.JWT_SECRET_KEY as string);

   const {
    id, groupId, hotelGroupId, created_at, updated_at, active, disableTicket, deleted_at, role, remember_token, password, email_verified_at, updatedByStaffId, ...userdata
   } = user?.dataValues || user;

   const [headline, flightDiscounts, hotelDiscounts] = await Promise.all([
    Headlines.findOne({
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
    }),
    ...(groupId ? [
     Discounts.findAll({
      where: {groupId, approved: true},
      attributes: ["fareType", "discount", "markup", "coins", "coinsValueType"],
      raw: true
     })
    ]  : []),
    ...(hotelGroupId ? [
     HotelDiscounts.findAll({
      where: {hotelGroupId},
      attributes: ["minPrice", "maxPrice", "discount", "coins", "markup", "discountValueType", "markupValueType", "coinsValueType"],
      raw: true,
     })
    ]: [])
   ]);

   const data = {
    user: userdata,
    headlines,
    token: userToken,
    flightDiscounts,
    hotelDiscounts
   } as Record<string, unknown>;

   if (headline) data['headline'] = headline;

   //  return res.status(201).json({success: true});
   return res.status(201).json(data);
  });
 } catch (error) {
  next(error);
 };
};

export default verifyUser;