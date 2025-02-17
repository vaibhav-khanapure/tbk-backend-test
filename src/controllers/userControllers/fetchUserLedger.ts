import type {Request, Response, NextFunction} from "express";
import { Op } from 'sequelize';
import Ledgers from "../../database/tables/ledgerTable";

const fetchUserLedgers = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res.locals?.user?.id;

  if (!userId) return res.status(401).json({message: "Unauthorized"});

  const {from, to = new Date(), page = 1, limit = 50} = req.query;

  const queryOptions = { 
   where: {userId},
   offset: (Number(page) - 1) * Number(limit),
   limit,
   order: [['created_at', 'DESC']],
   raw: true,
   attributes: {
    exclude: ["id", "addedBy", "updatedBy", "updated_at", "userId", "reason", "PaxName", "TransactionId", "paymentMethod"]
   },
  } as Record<string, any>;

  if (from?.length) {
   queryOptions.where.created_at = { [Op.between]: [new Date(from as string), new Date(to as string)] };
  };

  const [totalCount, ledgers] = await Promise.all([
   Ledgers.count({where: {userId}}), 
   Ledgers.findAll(queryOptions),
  ]);

  return res.status(200).json({data: ledgers, totalCount});
 } catch (error) {
  next(error); 
 };
};

export default fetchUserLedgers;