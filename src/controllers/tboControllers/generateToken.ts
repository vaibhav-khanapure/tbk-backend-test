import type {NextFunction, Request, Response} from "express";
import tboTokenGeneration from "../../utils/tboTokenGeneration";

const generateToken = async (req: Request, res: Response, next: NextFunction) => {
 try {
  await tboTokenGeneration();
  return res.status(200).json({message: "Token generated Successfully"});
 } catch (error) {
  next(error);
 };
};

export default generateToken;