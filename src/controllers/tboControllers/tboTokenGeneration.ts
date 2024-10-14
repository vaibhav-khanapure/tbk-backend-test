import axios from "axios";
import type {NextFunction, Request, Response} from "express";
import prisma from "../../config/prisma";
import {v4 as uuidv4} from "uuid";

const tboTokenGeneration = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const dataTosend= {
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
  
  const firstSetting = await prisma.setting.findFirst();

              //  const updatedSetting = await prisma.setting.create({
              //         data: { 
              //             id: uuidv4(),
              //             TboTokenId: data.TokenId },
              //       });
  

  if(firstSetting) {
   const updatedSetting = await prisma.setting.update({
    where: { id: firstSetting.id },
    data: { TboTokenId: data.TokenId },
   });
    
   console.log("Token updated in the settings table:", data.TokenId);
//    return res.status(201).json({success: true});
  } else {
   const newSetting = await prisma.setting.create({
    data: {
     id: uuidv4(),
     TboTokenId: data.TokenId,
    },
   });
  }
 } catch (error) {
  console.error(error.message);
  // next(error);
 };
};
  
export default tboTokenGeneration;