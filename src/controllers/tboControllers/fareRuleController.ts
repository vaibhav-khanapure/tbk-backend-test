import axios from "axios";
import prisma from "../../config/prisma";
import type {NextFunction, Request, Response} from "express";

const fareRuleController = async(req: Request, res: Response, next: NextFunction) => {
 try {
  const fareRuleData = req.body;
  const settingData = await prisma.setting.findFirst();
  fareRuleData.TokenId = settingData.TboTokenId;

  const {data} = await axios({
   method: 'post',
   headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
   },
   url: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/FareRule',
   data: fareRuleData,
  });
        
  return res.status(200).json({ message :"Success" , data:data}) 
 } catch (error) {
  next(error);
 };
};

export default fareRuleController;