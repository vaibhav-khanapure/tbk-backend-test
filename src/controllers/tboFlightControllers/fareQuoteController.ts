import type {NextFunction, Request, Response} from "express";
import {readFile} from "fs/promises";
import { fixflyTokenPath } from "../../config/paths";
import ApiTransactions from "../../database/tables/apiTransactions";
import { tboFlightSearchAPI } from "../../utils/tboFlightAPI";

const fareQuoteController = async(req: Request, res: Response, next: NextFunction)=>{
 try {
  const token = await readFile(fixflyTokenPath, "utf-8");
  req.body.TokenId = token;
  req.body.EndUserIp = process.env.END_USER_IP;

  const {data} = await tboFlightSearchAPI.post("/FareQuote", req.body);

  const id = res.locals?.user?.id || "";
  const name = res.locals?.user?.name || "";

  ApiTransactions.create({
   apiPurpose: "farequote",
   requestData: req.body,
   responseData: data,
   TraceId: req.body.TraceId, 
   TokenId: token,
   userId: id,
   username: name,
  });

  return res.status(200).json({data});
 } catch (error) {
  next(error);
 };
};

export default fareQuoteController;
