import type {NextFunction, Request, Response} from "express";
import {readFile} from "fs/promises";
import { fixflyTokenPath } from "../../config/paths";
import ApiTransactions from "../../database/tables/apiTransactionsTable";
import { tboFlightSearchAPI } from "../../utils/tboFlightAPI";
import FareQuotes from "../../database/tables/fareQuotesTable";
import createSHA256Hash from "../../utils/createHash";

const fareQuoteController = async(req: Request, res: Response, next: NextFunction)=>{
 try {
  const token = await readFile(fixflyTokenPath, "utf-8");
  req.body.TokenId = token;
  req.body.EndUserIp = process.env.END_USER_IP;

  const id = res.locals?.user?.id || "";
  const username = res.locals?.user?.name || "";

  if (!id) return res.status(401).json({message: "Unauthorized"});

  const {data} = await tboFlightSearchAPI.post("/FareQuote", req.body);

  const publishedFare = data?.Response?.Results?.Fare?.PublishedFare || 0;

  const saveFareQuote = () => {
   if (data?.Response?.Error?.ErrorCode !== 0) return [];

   if (req.body.new) {
    // if (!data?.Response?.IsPriceChanged) return [];
    const segments = data?.Response?.Results?.Segments || [];

    return [
     FareQuotes.update(
      { newPublishedFare: Number(publishedFare).toFixed(2), isPriceChanged: data?.Response?.IsPriceChanged, segments },
      { where: {uuid: createSHA256Hash(req.body.ResultIndex) },
     })
    ];
   };

   return [
    FareQuotes.create({
     uuid: createSHA256Hash(req.body.ResultIndex),
     ResultIndex: req.body?.ResultIndex,
     isPriceChanged: false,
     oldPublishedFare: Number(publishedFare).toFixed(2)
    }, {raw: true})
   ];
  };

  await Promise.allSettled([
   ApiTransactions.create({
    apiPurpose: "farequote",
    requestData: req.body,
    responseData: data,
    TraceId: req.body.TraceId,
    TokenId: token,
    userId: id,
    username,
   }, {raw: true}),
   ...saveFareQuote(),
  ]);

  return res.status(200).json({data});
 } catch (error) {
  next(error);
 };
};

export default fareQuoteController;
