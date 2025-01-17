import type {NextFunction, Request, Response} from "express";
import tboTokenGeneration from "../../utils/tboTokenGeneration";

const generateToken = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const token = await tboTokenGeneration();
  if (!token) return res.status(400).json({message: "Token generation failed"});
  return res.status(200).json({message: "Token generated Successfully", token});
 } catch (error) {
  next(error);
 };
};

export default generateToken;