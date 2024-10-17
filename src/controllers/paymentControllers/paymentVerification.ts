import crypto from "crypto";
import type {Request, Response, NextFunction} from "express";

const paymentVerification = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
   .createHmac("sha256", process.env.RAZORPAY_APT_SECRET as string)
   .update(body.toString())
   .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if(!isAuthentic) return res.status(400).json({success: false});

  await Payment.create({
   razorpay_order_id,
   razorpay_payment_id,
   razorpay_signature,
  });

  const url = `http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`;
  return res.status(301).redirect(url);
 } catch (error) {
  next(error);
 };  
};

export default paymentVerification;