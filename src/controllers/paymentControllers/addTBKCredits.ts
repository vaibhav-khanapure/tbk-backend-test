import type {Request, Response, NextFunction} from "express";
import Users from "../../database/tables/usersTable";

const addTBKCredits = async (req: Request, res: Response, next: NextFunction) => {
 const {id} = res.locals?.user;
 const {amount} = req.body;

 if (!Number(amount)) return res.status(400).json({message: 'Valid Amount is required'});

 try {
  const user = await Users.findOne({where: {id}});
  if (!user) return res.status(404).json({message: 'User not found'});

  const tbkCredits = Number(user?.dataValues?.tbkCredits) + Number(amount);

  await Users.update({tbkCredits}, {where: {id}});
  return res.status(200).json({tbkCredits});
 } catch (error: any) {
  next(error);
 };
};

export default addTBKCredits;