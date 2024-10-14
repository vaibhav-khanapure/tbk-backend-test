import type {Request, Response, NextFunction} from "express";
import prisma from "../../config/prisma";

const addTravellerDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  // Extract the traveller details from the request body
  const {user} = res.locals;
  const userId = user?.id;

  const travellerDetails = req.body;
  
  // Check if the input is an array
  if (!Array.isArray(travellerDetails)) {
   return res.status(400).json({ message: 'Invalid input format. Expected an array of traveller details.' });
  };

  // Insert each traveller detail into the database
  const results = await Promise.all(
   travellerDetails.map(detail =>
     prisma.travellerDetails.create({
      data: {
       firstName: detail.firstName,
       lastName: detail.lastName,
       dateOfBirth: new Date(detail.dateOfBirth), // Convert string to Date
       nationality: detail.nationality,
       gender: detail.gender,
       travelerType: detail.travelerType,
       passportNo: detail.passportNo || null, // Handle optional fields
       passportExpiry: detail.passportExpiry || null,
       passportissuingCountry: detail.passportissuingCountry || null,
       userId,
      }
     })
    )
   );

  // Send a success response
  return res.status(201).json({ data: results });
 } catch (error) {
  next(error);
 };
};

export default addTravellerDetails;