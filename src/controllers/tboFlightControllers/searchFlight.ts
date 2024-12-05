import type {Request, Response, NextFunction} from "express";
import { readFile } from "fs/promises";
import { fixflyTokenPath } from "../../config/paths";
import tboFlightAPI from "../../utils/tboFlightAPI";

const searchFlight = async (req: Request,res: Response,next: NextFunction) => {
 try {  
  const token = await readFile(fixflyTokenPath, "utf-8");
  req.body.TokenId = token;

  const {data} = await tboFlightAPI.post("/Search", req.body);
  return res.status(200).json({data}); 
 } catch (error: any) {
  next(error);
 };
};

export default searchFlight;