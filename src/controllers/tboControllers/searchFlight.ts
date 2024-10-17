import type {Request, Response, NextFunction} from "express";
import axios from "axios";
import Settings from "../../database/tables/settingsTable";

const searchFlight = async (req: Request,res: Response,next: NextFunction) => {
 try {
  const FlightSearchData = req.body;

  const settingData = await Settings.findOne();

  FlightSearchData.TokenId = settingData?.TboTokenId;

  const {data} = await axios({
   method: 'post',
   headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
   },
   url: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Search',
   data: FlightSearchData,
  });
  
  return res.status(200).json({data}); 
 } catch (error) {
  next(error);
 };
};

export default searchFlight;