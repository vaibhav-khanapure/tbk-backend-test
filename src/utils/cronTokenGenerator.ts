import cron from "node-cron";
import tboTokenGeneration from "./tboTokenGeneration";

const cronTokenGenerator = () => {
 cron.schedule('5 0 * * *', async () => {
  try {
   await tboTokenGeneration();
  } catch (error: any) {
   console.error('Error in token generation:', error?.message);
  };
 });
};

export default cronTokenGenerator;