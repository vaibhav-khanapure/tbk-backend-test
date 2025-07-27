import "dotenv/config";
import jwt from "jsonwebtoken";
import type {NextFunction, Request, Response} from "express";
import Users from "../../database/tables/usersTable";
import Headlines from "../../database/tables/headlinesTable";
import { Op } from "sequelize";
import sequelize from "../../config/sql";

const checkUser = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const id = res.locals?.user?.id;
  const email = res.locals?.user?.email;

  if (!id || !email) return res.status(401).json({message: "Unauthorized"});

  const exclude = ["id", "role", "email_verified_at", "remember_token", "password", "disableTicket", "created_at", "updated_at", "deleted_at", "updatedByStaffId"];

  // const user = await Users.findByPk(id, { attributes: {exclude}, raw: true });
  // here find by id and email
  // const user = await Users.findOne({where: {id, email}, attributes: {exclude}, raw: true});

  const [user, headlines] = await Promise.all([
   Users.findOne({where: {id, email}, attributes: {exclude}, raw: true}),
   Headlines.findAll({
    where: { type: { [Op.in]: ['flight', 'hotel'] } },
    attributes: ['name', 'description', 'type'],
    raw: true
   })
  ]);

  if (!user) return res.status(404).json({message: "No user found"});
  if (!user?.active) {
   return res.status(400).json({message: "Please contact user admin to enable your Account"});
  };

  const headline = await Headlines.findOne({
   where: {
     [Op.or]: [
       { userId: id },
       { groupId: user?.groupId },
       { type: 'top' }
     ]
   },
   attributes: ['name', 'description'],
   order: [
    [sequelize.literal(`CASE 
      WHEN "userId" = ${id} THEN 1
      WHEN "groupId" = ${user?.groupId ?? null} THEN 2
      WHEN "type" = 'top' THEN 3
      ELSE 4 END`), 'ASC']
   ],
   raw: true,
  });

  const {active, groupId, hotelGroupId, ...userdata} = user;
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

  if (groupId) jwtData["groupId"] = groupId;
  if (hotelGroupId) jwtData["hotelGroupId"] = hotelGroupId;

  const token = jwt.sign(jwtData, process.env.JWT_SECRET_KEY as string);

  const data = {
   user: userDetails,
   headlines,
   token,
  } as Record<string, unknown>;

  if (headline) data['headline'] = headline;

  return res.status(200).json({data});
 } catch (error) {
  next(error);
 };
};

export default checkUser;