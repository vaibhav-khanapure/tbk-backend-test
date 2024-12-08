import type {NextFunction, Request, Response} from "express";
import { fixflyTokenPath } from "../../config/paths";
import { readFile } from "fs/promises";
import tboFlightAPI from "../../utils/tboFlightAPI";

const SSRController = async (req: Request, res: Response, next: NextFunction)=>{
 try {
  const token = await readFile(fixflyTokenPath, "utf-8");
  req.body.TokenId = token;
  req.body.EndUserIp = process.env.END_USER_IP;

  const {data} = await tboFlightAPI.post("/SSR", req.body);
  return res.status(200).json({data});
 } catch (error) {
  next(error);  
 };
};

export default SSRController;