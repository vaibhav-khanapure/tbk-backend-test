import "dotenv/config";
import axios from "axios";
import cron from "node-cron";

const cronHotelAccessTokenGenerator = () => {
 cron.schedule('0 0 1 * *', async () => {
  try {
   const URL = `${process.env.HOTEL_API_URL}/hotelsapi/auth/accessToken`;
   await axios.get(URL);
  } catch (error: any) {
   console.error('Error in Hotel Access Token generation:', error?.message);
  };
 }, {
  scheduled: true,
  timezone: 'Asia/Kolkata'
 });
};

export default cronHotelAccessTokenGenerator;