import type {Request, Response, NextFunction} from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import "dotenv/config";

const instance = new Razorpay({
 key_id: process.env.RAZORPAY_API_KEY as string,
 key_secret: process.env.RAZORPAY_APT_SECRET as string,
});

const checkout = async (req: Request, res: Response, next: NextFunction) => {
 const {amount} = req.body;
 if(!amount) return res.status(400).json({message: "Please Provide Amount"});

 try {
  const options = {
   amount: Number(amount * 100),
   currency: "INR",
   receipt: crypto.randomBytes(10).toString("hex"),
  };

  const order = await instance.orders.create(options);
  return res.status(201).json({order});
 } catch (error) {
  console.log("EEEEEEEEEEEEEEEEEEEEE", error)
  next(error);
 };
};

export default checkout;