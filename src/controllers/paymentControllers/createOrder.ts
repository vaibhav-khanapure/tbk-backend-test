import type {Request, Response, NextFunction} from "express";
import crypto from "crypto";
import razorpay from "../../config/razorpay";

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
 try {
  let {amount} = req.body;
  if(!Number(amount)) return res.status(400).json({message: "Please Provide Valid Amount"});
 
  amount = Math.floor(Number(amount) * 100);

  const options = {
   amount,
   currency: "INR",
   receipt: crypto.randomBytes(10).toString("hex"),
   payment_capture: 1, // Enable auto-capture for this order
  };

  const order = await razorpay.orders.create(options);
  return res.status(201).json({order});
 } catch (error) {
  next(error);
 };
};

export default createOrder;