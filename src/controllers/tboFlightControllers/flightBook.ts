import type {NextFunction, Request, Response} from "express";
import {fixflyTokenPath} from "../../config/paths";
import {readFile} from "fs/promises";
import tboFlightAPI from "../../utils/tboFlightAPI";
import ApiTransactions from "../../database/tables/apiTransactions";

const flightBook = async(req: Request, res: Response, next: NextFunction)=>{
 try {
  const token = await readFile(fixflyTokenPath, "utf-8");
  req.body.TokenId = token;
  req.body.EndUserIp = process.env.END_USER_IP;

  const {data} = await tboFlightAPI.post("/Book", req.body);

  const {id, name} = res.locals?.user;

  ApiTransactions.create({
   apiPurpose: "book-nonlcc",
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

export default flightBook;