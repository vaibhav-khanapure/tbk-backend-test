import cron from "node-cron";
import {tboTokenGeneration} from "../../../server/controllers/tbo.controller";

const tokenGenerator = () => {
 cron.schedule('5 0 * * *', async () => {
  try {
   await tboTokenGeneration(); // Call your token generation function
  } catch (error) {
   console.error('Error in token generation:', error.message);
  };
 });
};

export default tokenGenerator;