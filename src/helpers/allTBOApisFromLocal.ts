import { NextFunction, Request, Response } from "express";
import { readFile } from "fs/promises";
import { fixflyTokenPath } from "../config/paths";
import axios from "axios";
import { tboFlightSearchAPI } from "../utils/tboFlightAPI";

const allTBOApisFromLocal = async (req: Request, res: Response, next: NextFunction) => {
 try { 
  const body = req.body;

  console.log("BODY", body);
   
  const token = await readFile(fixflyTokenPath, "utf-8");
  req.body.TokenId = token;
  req.body.EndUserIp = process.env.END_USER_IP;
  const APIUrl = process.env.TBO_FLIGHT_SEARCH_API_URL;

  const url = req.body.url;

  const URL = `${APIUrl}/${url}`;

  const {data} = await axios({
   headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
    },
    url: URL,
    method: 'POST',
    data: req.body
  });

  return res.status(200).json(data);
 } catch (error) {
  return res.status(200).json(error);
 }
};

export default allTBOApisFromLocal;