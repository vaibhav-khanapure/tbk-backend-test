import type { Request, Response, NextFunction } from "express";
import { readFile } from "fs/promises";
import { fixflyTokenPath } from "../../config/paths";
import { tboFlightSearchAPI } from "../../utils/tboFlightAPI";
import Discounts from "../../database/tables/discountsTable";

const searchFlights = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const id = res.locals?.user?.id;

  const token = await readFile(fixflyTokenPath, "utf-8");
  req.body.TokenId = token;
  req.body.EndUserIp = process.env.END_USER_IP;

  const [{data}, flightDiscounts] = await Promise.all([
   tboFlightSearchAPI.post("/Search", req.body),
   Discounts.findAll({
    where: {userId: id, approved: true},
    attributes: ["fareType", "discount", "markup"]
   }),
  ]);

  return res.status(200).json({data, flightDiscounts});
 } catch (error: any) {
  next(error);
 };
};

export default searchFlights;