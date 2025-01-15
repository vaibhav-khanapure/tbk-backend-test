import type {NextFunction, Request, Response} from "express";
import tboTokenGeneration from "../../utils/tboTokenGeneration";

const generateToken = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const success = await tboTokenGeneration();
  if (!success) return res.status(400).json({message: "Token generation failed"});
  return res.status(200).json(success);
 } catch (error) {
  next(error);
 };
};

export default generateToken;