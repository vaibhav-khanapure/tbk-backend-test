import "dotenv/config";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
 key_id: process.env.RAZORPAY_API_KEY as string,
 key_secret: process.env.RAZORPAY_API_SECRET as string,
});

export default razorpay;