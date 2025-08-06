import type {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import Users, {type UserAttributes} from "../../database/tables/usersTable";
import transporter from "../../config/email";
import Headlines from "../../database/tables/headlinesTable";
import { Op } from "sequelize";
import sequelize from "../../config/sql";

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

    const user = await Users.findOne({
     where: {...(phoneNumber ? {phoneNumber} : {email})},
     attributes: {exclude},
     raw: true,
    });

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

    const headline = await Headlines.findOne({
     where: {
      [Op.or]: [
        { userId: id },
        { groupId },
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

    return res.status(200).json({user: userDetails, token, headline});
   };

   const newUser = {
    name,
    email,
    phoneNumber,
    active: false,
    // active: process.env.SERVER_URL === "https://tbkbackend.onrender.com" ? false : true
   } as UserAttributes;

   if (GSTNo) newUser["GSTNumber"] = GSTNo;
   if (companyAddress) newUser["GSTCompanyAddress"] = companyAddress;
   if (companyName) newUser["GSTCompanyName"] = companyName;

   const [user] = await Promise.all([
    await Users.create(newUser),
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
    <div>
     <h2> Welcome to TBK !</h2>
     <p>Thank you for signing with us!</p>
     <p>You're just one step away from accessing seamless corporate travel bookings tailored to your business needs</p>
     <p>Our backend team will be in touch shortly to complete your account activation. To speed things up, you can also reach out to our support team—contact details are available on the Support Page.</p>
     <h5>We look forward to supporting your business travel!</h5>
    </div>
   `; 

   transporter.sendMail({
    from: '"Ticket Book Karo" <noreply@ticketbookkaro.com>', // sender address
    to: email,
    subject: "TBK Sign Up",
    text: "Account Created for TBK",
    html,
   });

   const jwtData = {
    id: user?.id,
    name,
    email: user?.email,
    sub: user?.id,
   } as Record<string, unknown>;

   if (user?.groupId) jwtData["groupId"] = user?.groupId;
   if (user?.hotelGroupId) jwtData["hotelGroupId"] = user?.hotelGroupId;

   const userToken = jwt.sign(jwtData, process.env.JWT_SECRET_KEY as string);

   const {id, groupId, hotelGroupId, created_at, updated_at, active, disableTicket, deleted_at, role, remember_token, password, email_verified_at, updatedByStaffId, ...userdata} = user?.dataValues || user;

//    return res.status(201).json({user: userdata, token: userToken});
   return res.status(201).json({success: true});
  });
 } catch (error) {
  next(error);
 };
};

export default verifyUser;