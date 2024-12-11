import crypto from "crypto";
import type {Request, Response, NextFunction} from "express";
import Payments from "../../database/tables/paymentsTable";

interface body {
 RazorpayOrderId: string;
 RazorpayPaymentId: string;
 RazorpaySignature: string;
};

const paymentVerification = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {id: userId} = res.locals?.user;
  const {RazorpayOrderId, RazorpayPaymentId, RazorpaySignature} = req.body as body;

  if(!RazorpayOrderId || !RazorpayPaymentId || !RazorpaySignature) {
   return res.status(400).json({message: "All fields are required"}); 
  };

  const sign = `${RazorpayOrderId} | ${RazorpayPaymentId}`;

  const expectedSignature = crypto
   .createHmac("sha256", process.env.RAZORPAY_APT_SECRET as string)
   .update(sign.toString())
   .digest("hex");

  const isAuthentic = expectedSignature === RazorpaySignature;

  if(!isAuthentic) return res.status(400).json({success: false});

  await Payments.create({
   RazorpayOrderId,
   RazorpayPaymentId,
   RazorpaySignature,
   userId
  });

  return res.status(201).json({success: true});
 } catch (error) {
  next(error);
 };  
};

export default paymentVerification;