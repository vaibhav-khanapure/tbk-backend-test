import type { Request, Response, NextFunction } from "express";
import { readFile } from "fs/promises";
import { fixflyTokenPath } from "../../config/paths";
import { tboFlightSearchAPI } from "../../utils/tboFlightAPI";
import Settings from "../../database/tables/settingsTable";

const searchFlights = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const token = await readFile(fixflyTokenPath, "utf-8");
  req.body.TokenId = token;
  req.body.EndUserIp = process.env.END_USER_IP;

  const [{data}, setting] = await Promise.all([
   tboFlightSearchAPI.post("/Search", req.body),
   Settings.findOne({attributes: {include: ["flightDiscount"]}}),
  ]);

  return res.status(200).json({data, flightDiscount: setting?.flightDiscount});
 } catch (error: any) {
  next(error);
 };
};

export default searchFlights;