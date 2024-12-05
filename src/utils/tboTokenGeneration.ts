import axios from "axios";
import {writeFile} from "fs/promises";
import { fixflyTokenPath } from "../config/paths";

const tboTokenGeneration = async () => {
 try {
  const authData = {
   ClientId: process.env.TBO_AUTH_CLIENT_ID,
   UserName: process.env.TBO_AUTH_USERNAME,
   Password: process.env.TBO_AUTH_PASSWORD,
   LoginType: 1,
   EndUserIp: "192.168.10.130",
  };

  const {data} = await axios({
   method: 'post',
   headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
   },
   url: process.env.TBO_AUTH_URL,
   data: authData,
  });

  process.env.TboTokenId = data?.TokenId;
  await writeFile(fixflyTokenPath, data?.TokenId);
  console.log("Token Updated Successfully");
 } catch (error: any) {
  console.error("Token Generation Error",error.message);
 };
};

export default tboTokenGeneration;