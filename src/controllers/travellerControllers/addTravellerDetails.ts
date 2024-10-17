import type {Request, Response, NextFunction} from "express";
import prisma from "../../config/prisma";
import TravellerDetails from "../../database/tables/travellerDetailsTable";

const addTravellerDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {user} = res.locals;
  const userId = user?.id;

  const travellerDetails = req.body;

  // Check if the input is an array
  if (!Array.isArray(travellerDetails)) {
   return res.status(400).json({ message: 'Invalid input format. Expected an array of traveller details.' });
  };

  // Insert each traveller detail into the database
  const results = await Promise.all(
   travellerDetails.map(async (detail) => {
    return await TravellerDetails.create({
     firstName: detail.firstName,
     lastName: detail.lastName,
     dateOfBirth: new Date(detail.dateOfBirth), // Convert string to Date
     nationality: detail.nationality,
     gender: detail.gender,
     travellerType: detail.travelerType,
     passportNumber: detail.passportNo || null, // Handle optional fields
     passportExpiry: detail.passportExpiry || null,
     passportIssuingCountry: detail.passportissuingCountry || null,
     userId,
    });
   }),
  );

  return res.status(201).json({data: results});
 } catch (error) {
  next(error);
 };
};

export default addTravellerDetails;