import "dotenv/config";
import axios from "axios";
import {writeFile} from "fs/promises";
import {fixflyTokenPath} from "../config/paths";

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

  const {data} = await axios({
   method: 'post',
   headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
   },
   url: TBO_AUTH_URL,
   data: authData,
  });

  process.env.TboTokenId = data?.TokenId;
  await writeFile(fixflyTokenPath, data?.TokenId);
  console.log("Token Updated Successfully");
 } catch (error: any) {
  console.error("Token Generation Error", error?.message);
 };
};

export default tboTokenGeneration;