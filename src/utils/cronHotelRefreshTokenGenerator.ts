import "dotenv/config";
import axios from "axios";
import cron from "node-cron";
import transporter from "../config/email";

const cronHotelRefreshTokenGenerator = () => {
 cron.schedule('0 0 * * *', async () => {
  try {
   const URL = `${process.env.HOTEL_API_URL}/hotelsapi/auth/refreshToken`;
   const {data} = await axios.get(URL);

   transporter.sendMail({
    from: '"Ticket Book Karo" <noreply@ticketbookkaro.com>',
    to: 'vaibhavk1965@gmail.com',
    subject: "Hotel Refresh Token",
    text: "Refresh token generated",
    html: `${JSON.stringify(data)}`,
   });
  } catch (error: any) {
   console.error('Error in Hotel Refresh Token generation:', error?.message);
   transporter.sendMail({
    from: '"Ticket Book Karo" <noreply@ticketbookkaro.com>',
    to: 'vaibhavk1965@gmail.com',
    subject: "Hotel Refresh Token Error",
    text: "Refresh token not generated",
    html: `${JSON.stringify(error)}`,
   })
  };
 }, {
  scheduled: true,
  timezone: 'Asia/Kolkata'
 });
};

export default cronHotelRefreshTokenGenerator;