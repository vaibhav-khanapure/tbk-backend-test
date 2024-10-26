import "dotenv/config";
import * as nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  // @ts-ignore
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // tls: {
  //   rejectUnauthorized: false,
  // },
});

export default transporter;