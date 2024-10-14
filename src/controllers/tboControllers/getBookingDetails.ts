import type {NextFunction, Request, Response} from "express";
import prisma from "../../config/prisma";
import axios from "axios";

const getBookingDetails = async (req: Request, res: Response, next: NextFunction)=>{
 try {
  const bookingDetailsData = req.body; 
  const settingData = await prisma.setting.findFirst();
  bookingDetailsData.TokenId = settingData.TboTokenId;

  const {data} = await axios({
   method: 'post',
   headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
   },
   url: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/GetBookingDetails',
   data: bookingDetailsData,
  });
  
  return res.status(200).json({data}); 
 } catch (error) {
  next(error);
 };
};

export default getBookingDetails;