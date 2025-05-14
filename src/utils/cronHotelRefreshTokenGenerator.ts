import "dotenv/config";
import axios from "axios";
import cron from "node-cron";

const cronHotelRefreshTokenGenerator = () => {
 cron.schedule('0 0 * * *', async () => {
  try {
   const URL = `${process.env.HOTEL_API_URL}/hotelsapi/auth/refeshToken`; 
   await axios.get(URL);
  } catch (error: any) {
   console.error('Error in Hotel Refresh Token generation:', error?.message);
  };
 }, {
  scheduled: true, 
  timezone: 'Asia/Kolkata'
 });
};

export default cronHotelRefreshTokenGenerator;