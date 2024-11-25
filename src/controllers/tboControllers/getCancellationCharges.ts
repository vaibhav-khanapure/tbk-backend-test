import axios from "axios";
import type {NextFunction, Request, Response} from "express";
import Settings from "../../database/tables/settingsTable";

const getCancellationCharges = async (req: Request,res: Response, next: NextFunction)=>{
 try {
  const settingData = await Settings.findOne();
  req.body.TokenId = settingData?.dataValues?.TboTokenId;
  req.body.EndUserIp = process.env.EndUserIp;

  const {data} = await axios({
   method: 'post',
   headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
   },
   url: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/GetCancellationCharges',
   data: req.body,
  });

  return res.status(200).json({data}); 
 } catch (error) {
  next(error);
 };
};

export default getCancellationCharges;