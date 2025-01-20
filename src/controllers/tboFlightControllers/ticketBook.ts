import type {NextFunction, Request, Response} from "express";
import {readFile} from "fs/promises";
import {fixflyTokenPath} from "../../config/paths";
import ApiTransactions from "../../database/tables/apiTransactions";
import {tboFlightBookAPI} from "../../utils/tboFlightAPI";
import Users from "../../database/tables/usersTable";
import type {Passenger} from "../../types/BookedFlights";

const ticketBook = async (req: Request, res: Response, next: NextFunction)=>{
 try {
  const id = res.locals?.user?.id;
  const name = res.locals?.user?.name;

  const [token, user] = await Promise.all([
   readFile(fixflyTokenPath, "utf-8"),
   Users.findOne({where: {id}}),
  ]);

  if (!user?.active) {
   return res.status(400).json({message: "You don't have permission for booking"}); 
  };

  req.body.TokenId = token;
  req.body.EndUserIp = process.env.END_USER_IP;

  const {data} = await tboFlightBookAPI.post("/Ticket", req.body);

  const leadUser = req.body?.Passengers?.find((passenger: Passenger) => passenger?.IsLeadPax);

  let note = "";

  if (leadUser) {
   const FirstName = leadUser?.FirstName || "";
   const LastName = leadUser?.LastName || "";

   note = `Passenger ${FirstName} ${LastName}`;
  };

  ApiTransactions.create({
   apiPurpose: "ticketbook",
   requestData: req.body,
   responseData: data,
   TraceId: req.body.TraceId, 
   TokenId: token,
   userId: id,
   username: name,
   note,
  });

  return res.status(200).json({data});
 } catch (error: any) {
  next(error);
 };
};

export default ticketBook;