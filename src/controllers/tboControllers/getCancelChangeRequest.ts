import axios from "axios";
import type {NextFunction, Request, Response} from "express";
import Settings from "../../database/tables/settingsTable";

const getCancelChangeRequest = async (req: Request,res: Response, next: NextFunction)=>{
 try {
  const cancelRequestData = req.body;
  const settingData = await Settings.findOne();
  cancelRequestData.TokenId = settingData?.TboTokenId;

  const { data } = await axios({
   method: 'post',
   headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
   },
   url: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/SendChangeRequest',
   data: cancelRequestData,
  });
  
  return res.status(200).json({data}); 
 } catch (error) {
  next(error);
 };
};

export default getCancelChangeRequest;