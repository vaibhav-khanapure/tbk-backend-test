import type {NextFunction, Request, Response} from "express";
import {readFile} from "fs/promises";
import { fixflyTokenPath } from "../../config/paths";
import tboAPI from "../../utils/tboAPI";

const fareQuoteController = async(req: Request, res: Response, next: NextFunction)=>{
 try {
  const token = await readFile(fixflyTokenPath, "utf-8");
  req.body.TokenId = token;

  const {data} = await tboAPI.post("/FareQuote", req.body);
  return res.status(200).json({data}) 
 } catch (error) {
  next(error);
 };
};

export default fareQuoteController;
