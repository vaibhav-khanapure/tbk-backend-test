import axios from "axios";
import type {NextFunction, Request, Response} from "express";
import Settings from "../../database/tables/settingsTable";

const fareQuoteController = async(req: Request, res: Response, next: NextFunction)=>{
 try {
  const FareQuoteData = req.body;
  const settingData = await Settings.findOne();
  FareQuoteData.TokenId = settingData?.dataValues.TboTokenId;

  const {data} = await axios({
   method: 'post',
   headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
   },
   url: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/FareQuote',
   data: FareQuoteData,
  });

  return res.status(200).json({message :"Success", RequestData: FareQuoteData, data}) 
 } catch (error) {
  next(error);
 };
};

export default fareQuoteController;
