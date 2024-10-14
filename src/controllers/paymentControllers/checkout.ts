import type {Request, Response, NextFunction} from "express";
import Razorpay from "razorpay";

const instance = new Razorpay({
 key_id: process.env.RAZORPAY_API_KEY as string,
 key_secret: process.env.RAZORPAY_APT_SECRET as string,
});

const checkout = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const options = {
   amount: Number(req.body.amount * 100),
   currency: "INR",
  };

  const order = await instance.orders.create(options);  
  return res.status(200).json({order});
 } catch (error) {
  next(error);    
 };
};

export default checkout;