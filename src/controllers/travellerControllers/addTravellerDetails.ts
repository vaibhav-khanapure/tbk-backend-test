import type {Request, Response, NextFunction} from "express";
import TravellerDetails from "../../database/tables/travellerDetailsTable";

const addTravellerDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {user} = res.locals;
  const userId = user?.id;

  const travellerDetails = req.body;

  if (!Array.isArray(travellerDetails)) {
   return res.status(400).json({message: 'Invalid input format. Expected an array of traveller details'});
  };

  // Insert each traveller detail into the database
  const results = await Promise.all(
   travellerDetails.map(async (detail) => {
    return await TravellerDetails.create({
     firstName: detail.firstName,
     lastName: detail.lastName,
     nationality: detail.nationality,
     gender: detail.gender,
     travellerType: detail.travellerType,
     passportNumber: detail.passportNo || null,
     passportExpiry: detail.passportExpiry || null,
     passportIssuingCountry: detail.passportissuingCountry || null,
     userId,
    ...(detail.dateOfBirth ? {dateOfBirth: new Date(detail.dateOfBirth)} : {}),
    });
   }),
  );

  return res.status(201).json({data: results});
 } catch (error) {
  console.log("#############################################", error?.message);
  next(error);
 };
};

export default addTravellerDetails;