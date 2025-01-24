import type {Request, Response, NextFunction} from "express";
import crypto from "crypto";
import razorpay from "../../config/razorpay";
import Payments from "../../database/tables/paymentsTable";

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res.locals?.user?.id;  
  let amount = req.body?.amount;
  if(!Number(amount)) return res.status(400).json({message: "Please Provide Valid Amount"});
 
  amount = Math.floor(Number(amount) * 100);

  const options = {
   amount,
   currency: "INR",
   receipt: crypto.randomBytes(10).toString("hex"),
   payment_capture: 1, // Enable auto-capture for this order
  };

  const order = await razorpay.orders.create(options);
  const OrderAmount = (Number(order?.amount) / 100)?.toFixed(2);

  Payments?.create({
   RazorpayOrderId: order?.id,
   Reason: "Added TBK Wallet Payment",
   OrderAmount,
   userId
  });

  return res.status(201).json({order});
 } catch (error) {
  next(error);
 };
};

export default createOrder;