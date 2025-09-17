import type { Request, Response, NextFunction } from "express";
import { readFile } from "fs/promises";
import { fixflyTokenPath } from "../../config/paths";
import { tboFlightSearchAPI } from "../../utils/tboFlightAPI";

const searchFlights = async (req: Request, res: Response, next: NextFunction) => {
 try {
//   const userId = res.locals?.user?.id;

  const token = await readFile(fixflyTokenPath, "utf-8");
  req.body.TokenId = token;
  req.body.EndUserIp = process.env.END_USER_IP;

  const {data} = await tboFlightSearchAPI.post("/Search", req.body);

  return res.status(200).json(data);
 } catch (error: any) {
  next(error);
 };
};

export default searchFlights;