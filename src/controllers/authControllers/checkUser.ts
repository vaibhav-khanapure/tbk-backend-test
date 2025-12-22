import "dotenv/config";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import Users from "../../database/tables/usersTable";
import Headlines from "../../database/tables/headlinesTable";
import { Op } from "sequelize";
import sequelize from "../../config/sql";
import Discounts from "../../database/tables/discountsTable";
import HotelDiscounts from "../../database/tables/hotelDiscountsTable";

const checkUser = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const id = res.locals?.user?.id;
  const email = res.locals?.user?.email;
  const groupId = res.locals?.user?.groupId;
  const hotelGroupId = res?.locals?.user?.hotelGroupId;

  if (!id || !email) return res.status(401).json({message: "Unauthorized"});

  const exclude = ["id", "email_verified_at", "remember_token", "password", "disableTicket", "created_at", "updated_at", "deleted_at", "updatedByStaffId"];

  // const user = await Users.findByPk(id, { attributes: {exclude}, raw: true });
  // here find by id and email
  // const user = await Users.findOne({where: {id, email}, attributes: {exclude}, raw: true});

  const [user, headlines, headline, flightDiscounts, hotelDiscounts] = await Promise.all([
   Users.findOne({where: {id, email}, attributes: {exclude}, raw: true}),
   Headlines.findAll({
    where: { type: { [Op.in]: ['flight', 'hotel'] } },
    attributes: ['name', 'description', 'type'],
    raw: true
   }),
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
      WHEN "groupId" = ${groupId ?? null} AND "type" = 'top' THEN 2
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
   ] : []),
   ...(hotelGroupId ? [
    HotelDiscounts.findAll({
     where: {hotelGroupId},
     attributes: ["minPrice", "maxPrice", "discount", "coins", "markup", "discountValueType", "markupValueType", "coinsValueType"],
     raw: true,
    })
   ]: [])
  ]);

  if (!user) return res.status(404).json({message: "No user found"});
  if (!user?.active) {
   return res.status(400).json({message: "Please contact user admin to enable your Account"});
  };

  console.log('user 4444444444444444444444444444444', user);

  const {active, groupId: GroupId, hotelGroupId: HotelGroupId, ...userdata} = user;
  const userDetails = {...userdata} as unknown as Record<string, string>;

  Object.keys(userDetails)?.forEach(key => {
   if (userDetails?.[key] === null || userDetails?.[key] === undefined) delete userDetails?.[key];
  });

  const jwtData = {
   id, 
   name: user?.name, 
   email: user?.email,
   sub: id
  } as Record<string, unknown>;

  if (GroupId) jwtData["groupId"] = GroupId;
  if (HotelGroupId) jwtData["hotelGroupId"] = HotelGroupId;

  const token = jwt.sign(jwtData, process.env.JWT_SECRET_KEY as string);

  const data = {
   user: userDetails,
   headlines,
   token,
   flightDiscounts,
   hotelDiscounts,
  } as Record<string, unknown>;

  if (headline) data['headline'] = headline;

  console.log("DATA IS ---------------------------------------------------------", data);

  return res.status(200).json(data);
 } catch (error) {
  next(error);
 };
};

export default checkUser;