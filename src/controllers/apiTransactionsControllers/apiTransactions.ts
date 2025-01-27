import type {NextFunction, Request, Response} from "express";
import ApiTransactions from "../../database/tables/apiTransactionsTable";

const apiTransactions = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const transactions = await ApiTransactions.findAll();
  return res.status(200).json({transactions});
 } catch (error) {
  next(error);
 };
};

export default apiTransactions;