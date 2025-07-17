import type {NextFunction, Request, Response} from "express";
import Users from "../../database/tables/usersTable";

const getUserCoins = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const id = res.locals?.user?.id;

  if (!id) return res.status(401).json({message: "Unauthorized"});

  const user = await Users.findByPk(id, {
   attributes: ["coins"],
   raw: true
  });

  if (!user) return res.status(404).json({message: 'User not found'});

  return res.status(200).json({coins: user?.coins});
 } catch (error) {
  next(error);
 };
};

export default getUserCoins;