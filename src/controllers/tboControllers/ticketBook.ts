import type {NextFunction, Request, Response} from "express";
import prisma from "../../config/prisma";
import axios from "axios";

const ticketBook = async (req: Request, res: Response, next: NextFunction)=>{
 try {
  const ticketBookData = req.body; 
  const settingData = await prisma.setting.findFirst();
  ticketBookData.TokenId = settingData.TboTokenId;
  
  const {data} = await axios({
   method: 'post',
   headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
   },
   url: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Ticket',
   data: ticketBookData,
  });
  
  return res.status(200).json({data});
 } catch (error) {
  next(error);
 };
};

export default ticketBook;