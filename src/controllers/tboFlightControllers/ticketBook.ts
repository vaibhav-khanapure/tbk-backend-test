import type {NextFunction, Request, Response} from "express";
import { readFile } from "fs/promises";
import { fixflyTokenPath } from "../../config/paths";
import ApiTransactions from "../../database/tables/apiTransactions";
import { tboFlightBookAPI } from "../../utils/tboFlightAPI";

const ticketBook = async (req: Request, res: Response, next: NextFunction)=>{
 try {
  const {id, name} = res.locals?.user;  
  const token = await readFile(fixflyTokenPath, "utf-8");
  req.body.TokenId = token;
  req.body.EndUserIp = process.env.END_USER_IP;

  const {data} = await tboFlightBookAPI.post("/Ticket", req.body);

  const leadUser = req.body?.Passengers?.find((item: any) => item?.isLeadPax);
  const {FirstName, LastName} = leadUser;

  ApiTransactions.create({
   apiPurpose: "ticketbook",
   requestData: req.body,
   responseData: data,
   TraceId: req.body.TraceId, 
   TokenId: token,
   userId: id,
   username: name,
   note: `Passenger ${FirstName} ${LastName}`
  });

  console.log("Hello world", {FirstName, LastName});

  return res.status(200).json({data});
 } catch (error) {
  next(error);
 };
};

export default ticketBook;