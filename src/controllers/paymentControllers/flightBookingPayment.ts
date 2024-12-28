import "dotenv/config";
import crypto from "crypto";
import type {Request, Response, NextFunction} from "express";
import razorpay from "../../config/razorpay";
import Payments from "../../database/tables/paymentsTable";
import generateTransactionId from "../../utils/generateTransactionId";

const flightBookingPayment = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {id: userId} = res.locals?.user;  
  const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;

  if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
   return res.status(400).json({message: "All fields are required"}); 
  };

  const sign = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
   .createHmac("sha256", process.env.RAZORPAY_API_SECRET as string)
   .update(sign.toString())
   .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if(!isAuthentic) return res.status(400).json({success: false});

  const payment = await razorpay.payments.fetch(razorpay_payment_id);

  const TrxnId = generateTransactionId();

  Payments?.create({
   RazorpayOrderId: razorpay_order_id,
   RazorpayPaymentId: razorpay_payment_id,
   RazorpaySignature: razorpay_signature,
   TransactionId: TrxnId,

   userId
  });

  return res.status(201).json({method: payment?.method, TrxnId});
 } catch (error) {
  next(error);
 };  
};

export default flightBookingPayment;