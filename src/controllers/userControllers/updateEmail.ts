import type {NextFunction, Request, Response} from "express";
import validateEmail from "../../utils/emailValidator";
import Users from "../../database/tables/usersTable";
import transporter from "../../config/email";
import jwt from "jsonwebtoken";
import uuid from "../../utils/uuid";

const updateEmail = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res.locals?.user?.id;

  if (!userId) return res.status(401).json({message: "Unauthorized"});

  const {email, step, otp, token} = req.body;

  if(!step) return res.status(400).json({message: "Please provide step number"});

  if (step === 1) {
   if (!email) return res.status(400).json({message: "Please provide Email"}); 
   if (!validateEmail(email)) return res.status(400).json({message: "Invalid Email"});

   const code = uuid(6, {capitalLetters: false, numbers: true});

   transporter.sendMail({
    from: '"Ticket Book Karo" <dhiraj@zendsoft.com>', // sender address
    to: email, // list of receivers
    subject: "Email update Code", // Subject line
    text: "code for updating Email for TicketBookKaro Account",
    html: `
     <h1>Please Enter the code below to update your Email, This code is only valid for next 20 minutes</h1>
     <p>The code is: <b>${code}</b></p>
    `,
   });

   const token = jwt.sign(
    {code, email},
    process.env.ACCESS_TOKEN_KEY as string,
    {expiresIn: "20m"}
   );

   return res.status(200).json({token});
  };

  if(step === 2) {
   if(!otp || !token) return res.status(400).json({message: "All fields are required"});

   jwt.verify(token, process.env.ACCESS_TOKEN_KEY as string, async (err: any, payload: any) => {
    if(err) return res.status(400).json({message: "Invalid Data"});

    const {code, email} = payload;

    if(code !== otp) return res.status(400).json({message: "The OTP you entered is wrong"});

    await Users.update({email}, {where: {id: userId}});

    return res.status(200).json({email});
   });
  };
 } catch (error) {
  next(error);
 };
};

export default updateEmail;