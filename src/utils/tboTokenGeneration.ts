import "dotenv/config";
import axios from "axios";
import {writeFile} from "fs/promises";
import {fixflyTokenPath} from "../config/paths";
import Settings from "../database/tables/settingsTable";

const tboTokenGeneration = async () => {
 try {
  const authData = {
   ClientId: process.env?.TBO_AUTH_CLIENT_ID,
   UserName: process.env?.TBO_AUTH_USERNAME,
   Password: process.env?.TBO_AUTH_PASSWORD,
   EndUserIp: process.env?.END_USER_IP,
   LoginType: 1,
  };

  const {data} = await axios({
   method: 'post',
   url: process.env?.TBO_AUTH_URL,
   data: authData,
   headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
   },
  });

  process.env.TboTokenId = data?.TokenId;

  console.log("Token Generation Response", data);

  await Promise.allSettled([
   writeFile(fixflyTokenPath, data?.TokenId),
   Settings.update({value: data?.TokenId}, {where: {key: "fixflyToken"}}),
  ]);

  return data?.TokenId;
 } catch (error: any) {
  console.log("Token Generation Error", error);

  return false;
 };
};

export default tboTokenGeneration;