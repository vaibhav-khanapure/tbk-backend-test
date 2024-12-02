import type {NextFunction, Request, Response} from "express";
import { fixflyTokenPath } from "../../config/paths";
import { readFile } from "fs/promises";
import tboAPI from "../../utils/tboAPI";

const getCancellationCharges = async (req: Request,res: Response, next: NextFunction)=>{
 try {
  const token = await readFile(fixflyTokenPath, "utf-8");
  req.body.EndUserIp = process.env.EndUserIp;
  req.body.TokenId = token;
  
  const {data} = await tboAPI.post("/GetCancellationCharges", req.body);
  return res.status(200).json({data}); 
 } catch (error) {
  next(error);
 };
};

export default getCancellationCharges;