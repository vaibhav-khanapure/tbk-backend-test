import type {NextFunction, Request, Response} from "express";
import axios from "axios";
import Settings from "../../database/tables/settingsTable";

const getChangeRequestStatus = async (req: Request, res: Response, next: NextFunction)=>{
 try {
  const cancelRequestStatus = req.body;
  const settingData = await Settings.findOne();
  cancelRequestStatus.TokenId = settingData?.TboTokenId;

  const {data} = await axios({
   method: 'post',
   headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
   },
   url: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/GetChangeRequestStatus',
   data: cancelRequestStatus,
  });

  return res.status(200).json({data});
 } catch (error) {
  next(error);
 };
};

export default getChangeRequestStatus;