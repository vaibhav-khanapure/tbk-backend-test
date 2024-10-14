import type {NextFunction, Request, Response} from "express";
import prisma from "../../config/prisma";
import axios from "axios";

const SSRController = async (req: Request, res: Response, next: NextFunction)=>{
 try {
  const SSRData = req.body;

  const settingData = await prisma.setting.findFirst();

  SSRData.TokenId = settingData.TboTokenId;

  const {data} = await axios({
   method: 'post',
   headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
   },
   url: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/SSR',
   data: SSRData,
  });
  
  return res.status(200).json({ message :"Success" , data:data}) 
 } catch (error) {
  next(error);  
 };
};

export default SSRController;