import "dotenv/config";
import axios from "axios";
import {writeFile} from "fs/promises";
import {fixflyTokenPath} from "../config/paths";
import Settings from "../database/tables/settingsTable";
import os from "os";

const {TBO_AUTH_CLIENT_ID, TBO_AUTH_USERNAME, TBO_AUTH_PASSWORD, END_USER_IP, TBO_AUTH_URL} = process.env;

const tboTokenGeneration = async () => {
 try {
  const authData = {
   ClientId: TBO_AUTH_CLIENT_ID,
   UserName: TBO_AUTH_USERNAME,
   Password: TBO_AUTH_PASSWORD,
   EndUserIp: END_USER_IP,
   LoginType: 1,
  };

  console.log("AUTHDATA", authData);
  console.log("URL", TBO_AUTH_URL);

  const nets = os.networkInterfaces();
  let serverIp = '127.0.0.1'; // default fallback

//   for (const name of Object.keys(nets)) {
//   for (const net of nets[name]) {
//     if (net.family === 'IPv4' && !net.internal) {
//       serverIp = net.address;
//       break;
//     }
//   }
//   if (serverIp !== '127.0.0.1') break;
//  };

  console.log('Server IP:', serverIp);

  const {data} = await axios({
   method: 'post',
   headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
   },
   url: TBO_AUTH_URL,
   data: authData,
  });

  console.log("RESPONSE", data);

  process.env.TboTokenId = data?.TokenId;

  await Promise.allSettled([
   writeFile(fixflyTokenPath, data?.TokenId),
   Settings.update({value: data?.TokenId}, {where: {key: "fixflyToken"}}),
  ]);

  console.log("DATA IS -- TOKEN", data);

  return data?.TokenId;
 } catch (error: any) {
  return false;
 };
};

export default tboTokenGeneration;