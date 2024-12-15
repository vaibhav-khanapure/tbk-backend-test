import type {Request, Response, NextFunction} from "express";
import crypto from "crypto";
import razorpay from "../../config/razorpay";

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
 const {amount} = req.body;
 if(!amount) return res.status(400).json({message: "Please Provide Amount"});

 try {
  const options = {
   amount: Number(amount) * 100,
   currency: "INR",
   receipt: crypto.randomBytes(10).toString("hex"),
  };

  const order = await razorpay.orders.create(options);
  return res.status(201).json({order});
 } catch (error) {
  next(error);
 };
};

export default createOrder;