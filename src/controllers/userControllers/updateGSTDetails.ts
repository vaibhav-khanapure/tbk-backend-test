import type {NextFunction, Request, Response} from "express";
import Users from "../../database/tables/usersTable";
import validateContact from "../../utils/contactValidator";

const updateGSTDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {id} = res.locals?.user;
  const {GSTCompanyAddress = "", GSTCompanyContactNumber = "", GSTCompanyName = "", GSTNumber = "", GSTCompanyEmail = ""} = req.body;

  if (GSTNumber) {
   if (GSTNumber?.includes(" ")) return res.status(400).json({message: "GST Number should not contain spaces"});
   if (GSTNumber?.length !== 15) return res.status(400).json({message: "GST Number should be 15 digits long"});
  };

  if (GSTCompanyContactNumber && !validateContact(GSTCompanyContactNumber)) {
   return res.status(400).json({message: "Contact Number is Invalid"}); 
  };

  if (GSTCompanyEmail && !validateContact(GSTCompanyEmail)) {
   return res.status(400).json({message: "Email is Invalid"}); 
  };

  await Users.update(req.body, {where: {id}});
  return res.status(200).json({success: true});
 } catch (error) {
  next(error);
 };
};

export default updateGSTDetails;