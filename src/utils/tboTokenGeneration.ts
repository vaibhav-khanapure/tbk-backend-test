import axios from "axios";
import {v4 as uuidv4} from "uuid";
import Settings from "../database/tables/settingsTable";

const tboTokenGeneration = async () => {
 try {
  const dataTosend = {
   ClientId:"ApiIntegrationNew",
   UserName:"Fixfly",
   Password:"Fixfly@1234",
   LoginType:1,
   EndUserIp: "192.168.10.130"
  };

  const {data} = await axios({
   method: 'post',
   headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
   },
   url: 'http://api.tektravels.com/SharedServices/SharedData.svc/rest/Authenticate',
   data: dataTosend,
  });

  const firstSetting = await Settings.findOne();

  if(!firstSetting) {
   await Settings.create({id: uuidv4(), TboTokenId: data.TokenId});
   console.log("Token created in the settings table:", data.TokenId);
  };

  if(firstSetting) {
   await Settings.update(
    {TboTokenId: data.TokenId},
    {where: {id: firstSetting.dataValues.id}}
   );

   console.log("Token updated in the settings table:", data.TokenId);
  };
 } catch (error: any) {
  console.error("Token Generation Error",error.message);
 };
};

export default tboTokenGeneration;