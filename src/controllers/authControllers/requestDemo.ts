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
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
     <h2 style="color:#2a4d8f;">Welcome to Ticket Book Karo (TBK)!</h2>
     <p>Thank you for requesting a demo with us 🎉</p>
     <p>
      Your interest in <strong>seamless corporate travel bookings</strong> means a lot to us. 
      Our team is preparing everything you need to experience how TBK can simplify and optimize your  business travel.
     </p>
     <p>
      One of our backend specialists will be in touch with you shortly to guide you through the demo and help set up your account. 
      If you’d like to get started even faster, you can reach out directly to our support team—contact details are available on our <a href="https://ticketbookkaro.com/support" style="color:#2a4d8f; text-decoration:none;">Support Page</a>.
     </p>
     <h4 style="margin-top:20px; color:#2a4d8f;">We look forward to helping you simplify business travel!</h4>
     <p style="margin-top:30px;">Best Regards,<br><strong>The TBK Team</strong></p>
    </div>
   `;

   Promise.allSettled([
    transporter.sendMail({
     from: '"Ticket Book Karo" <noreply@ticketbookkaro.com>', // sender address
     to: process.env.TBK_ADMIN_MAIL,
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
   ]).catch(err => {});
  };

  return res.status(200).json({success: true});
 } catch (error) {
  next(error);
 };
};

export default requestDemo;