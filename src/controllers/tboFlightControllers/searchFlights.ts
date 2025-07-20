import type { Request, Response, NextFunction } from "express";
import { readFile } from "fs/promises";
import { fixflyTokenPath } from "../../config/paths";
import { tboFlightSearchAPI } from "../../utils/tboFlightAPI";
import Discounts from "../../database/tables/discountsTable";

const searchFlights = async (req: Request, res: Response, next: NextFunction) => {
 try {
//   const userId = res.locals?.user?.id;
  const groupId = res.locals?.user?.groupId;

  const fetchDiscounts = req.query.fd;

  const token = await readFile(fixflyTokenPath, "utf-8");
  req.body.TokenId = token;
  req.body.EndUserIp = process.env.END_USER_IP;

  const [{data}, flightDiscounts] = await Promise.all([
   tboFlightSearchAPI.post("/Search", req.body),
   ...((groupId && fetchDiscounts) ? [
    Discounts.findAll({
     where: {groupId, approved: true},
     attributes: ["fareType", "discount", "markup", "coins", "coinsValueType"],
     raw: true
    })
   ] : []),
  ]);

  const response = {data} as Record<string, unknown>;

  if (flightDiscounts && Array.isArray(flightDiscounts)) {
   response.discounts = flightDiscounts;
  };

  return res.status(200).json(response);
 } catch (error: any) {
  next(error);
 };
};

export default searchFlights;