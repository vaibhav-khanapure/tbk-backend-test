import "dotenv/config";
import type {NextFunction, Request, Response} from "express";
import validateEmail from "../../utils/emailValidator";
import validateContact from "../../utils/contactValidator";
import transporter from "../../config/email";

const requestDemo = async (req: Request, res: Response, next: NextFunction) => {
 try {
  let {name, email, phoneNumber, companyName = "", companyAddress = "", GSTNo = ""} = req.body;

  name = name?.split(" ")?.filter(Boolean)?.join(" ")?.trim();
  email = email?.trim();
  phoneNumber = phoneNumber?.trim();
  companyAddress = companyAddress?.trim();
  companyName = companyName?.trim();
  GSTNo = GSTNo?.trim();

  if (!name || !email || !phoneNumber) return res.status(400).json({ message : "All fields are required"});

  // validations
  if (name?.length < 3) return res.status(400).json({message: "Name must include atleast 3 characters"});

  if (!validateEmail(email)) return res.status(400).json({message: "Invalid Email Provided"});

  // contact validation
  const [countryCode, phone] = phoneNumber?.split("-");
  const isIndianPhone = countryCode === "91";

  if (isIndianPhone && !validateContact(phone)) {
   return res.status(400).json({message: "Invalid Phone Number"});
  };

  if (!isIndianPhone && (!Number(phone) || (Number(phone) && phone?.length < 8))) {
   return res.status(400).json({message: "Invalid Phone Number"});
  };

  if (companyAddress && companyAddress?.length < 3) {
   return res.status(400).json({message: "Please Provide a valid Company Address"});
  };

  if (GSTNo) {
   if (GSTNo?.length !== 15) return res.status(400).json({message: "GST Number should be 15 digits long"});
   if (GSTNo?.includes(" ")) return res.status(400).json({message: "GST Number should not contain spaces"});
  };

  // Sending OTP to Email
  if (validateEmail(email)) {
   const html = `
    <h1>TBK Demo Request</h1>
    <div>
     <p>Name: <b>${name}</b></p>
     <p>Email: <b>${email}</b></p>
     <p>Phone Number: <b>${phoneNumber}</b></p>
     ${companyName ? `<p>Company Name: <b>${companyName}</b></p>` : ""}
     ${companyAddress ? `<p>Company Address: <b>${companyAddress}</b></p>` : ""}
     ${GSTNo ? `<p>GST Number: <b>${GSTNo}</b></p>` : ""}
    </div>
   `;

   const userHTML = `
    <h1>TBK Demo Request Received</h1>
    <div>
     <p>Dear ${name?.split(" ")}, We have recevied your demo request and our staff will contact you soon.</p>
     <p>Thanks & Regards</p>
     <p>Ticket Book Karo</p>
    </div>
   `;

   Promise.allSettled([
    transporter.sendMail({
     from: '"Ticket Book Karo" <noreply@ticketbookkaro.com>', // sender address
     to: email,
     subject: "TBK Demo Request",
     text: "Request for Demo for TBK",
     html,
    }),
    transporter.sendMail({
     from: '"Ticket Book Karo" <noreply@ticketbookkaro.com>', // sender address
     to: email,
     subject: "TBK Demo Request",
     text: "Request for Demo for TBK",
     html: userHTML,
    }),
   ]).catch(err => console.log("Request Demo Mail Error:::", err));
  };

  return res.status(200).json({success: true});
 } catch (error) {
  next(error);
 };
};

export default requestDemo;