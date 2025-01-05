import cron from "node-cron";
import tboTokenGeneration from "./tboTokenGeneration";

const cronTokenGenerator = () => {
 cron.schedule('0 0 * * *', async () => {
  try {
   await tboTokenGeneration();
  } catch (error: any) {
   console.error('Error in token generation:', error?.message);
  };
 }, {
  scheduled: true, 
  timezone: 'Asia/Kolkata'
 });
};

export default cronTokenGenerator;