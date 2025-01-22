import type {NextFunction, Request, Response} from "express";
import {readFile} from "fs/promises";
import {fixflyTokenPath} from "../../config/paths";
import {tboFlightSearchAPI} from "../../utils/tboFlightAPI";

const fareRuleController = async(req: Request, res: Response, next: NextFunction) => {
 try {
  const token = await readFile(fixflyTokenPath, "utf-8");
  req.body.TokenId = token;
  req.body.EndUserIp = process.env.END_USER_IP;

  const {data} = await tboFlightSearchAPI.post("/FareRule", req.body);
  return res.status(200).json({data}); 
 } catch (error) {
  next(error);
 };
};

export default fareRuleController;