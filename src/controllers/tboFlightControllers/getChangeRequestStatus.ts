import type {NextFunction, Request, Response} from "express";
import { readFile } from "fs/promises";
import { fixflyTokenPath } from "../../config/paths";
import { tboFlightBookAPI } from "../../utils/tboFlightAPI";

const getChangeRequestStatus = async (req: Request, res: Response, next: NextFunction)=>{
 try {
  const token = await readFile(fixflyTokenPath, "utf-8");
  req.body.TokenId = token;
  req.body.EndUserIp = process.env.END_USER_IP;

  const {data} = await tboFlightBookAPI.post("/GetChangeRequestStatus", req.body);
  return res.status(200).json({data});
 } catch (error) {
  next(error);
 };
};

export default getChangeRequestStatus;