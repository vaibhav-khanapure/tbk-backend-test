import type {Request, Response, NextFunction} from "express";
import TravellerDetails from "../../database/tables/travellerDetailsTable";

const addTravellerDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {user} = res?.locals;
  const userId = user?.id;

  const travellers = req.body;

  if (!Array.isArray(req.body)) {
   return res.status(400).json({message: 'Invalid input format. Expected an array of traveller details'});
  };

  const data = travellers?.map((traveller: TravellerDetails) => {
   const item = {} as TravellerDetails;
   const {id, isLead, ...Traveller} = traveller;

   for(let key in Traveller) {
    let Key  = key as unknown as keyof TravellerDetails
    if(traveller[Key]) item[Key] = traveller[Key];
   };

   return item;
  });

  const results = await TravellerDetails.bulkCreate(data?.map((detail: TravellerDetails) => ({...detail, userId})));
  return res.status(201).json({data: results});
 } catch (error) {
  next(error);
 };
};

export default addTravellerDetails;