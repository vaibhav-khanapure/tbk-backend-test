import axios from "axios";
import type {NextFunction, Request, Response} from "express";
import Settings from "../../database/tables/settingsTable";

const fareRuleController = async(req: Request, res: Response, next: NextFunction) => {
 try {
  const fareRuleData = req.body;
  const settingData = await Settings.findOne();
  fareRuleData.TokenId = settingData?.dataValues.TboTokenId;

  const {data} = await axios({
   method: 'post',
   headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
   },
   url: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/FareRule',
   data: fareRuleData,
  });
        
  return res.status(200).json({message :"Success", data:data}) 
 } catch (error) {
  next(error);
 };
};

export default fareRuleController;