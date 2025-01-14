import type {NextFunction, Request, Response} from "express";
import { readFile } from "fs/promises";
import { fixflyTokenPath } from "../../config/paths";
import tboFlightAPI from "../../utils/tboFlightAPI";
import ApiTransactions from "../../database/tables/apiTransactions";

const ticketBook = async (req: Request, res: Response, next: NextFunction)=>{
 try {
  const {id, name} = res.locals?.user;  
  const token = await readFile(fixflyTokenPath, "utf-8");
  req.body.TokenId = token;
  req.body.EndUserIp = process.env.END_USER_IP;

  const {data} = await tboFlightAPI.post("/Ticket", req.body);

  ApiTransactions.create({
   apiPurpose: "ticketbook",
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

export default ticketBook;