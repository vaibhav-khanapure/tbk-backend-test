import "dotenv/config";
import {createTransport} from "nodemailer";

const {EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS} = process.env;

const transporter = createTransport({
 // @ts-ignore
 host: EMAIL_HOST,
 port: EMAIL_PORT,
 secure: false,
 auth: {
  user: EMAIL_USER,
  pass: EMAIL_PASS,
 },
 tls: {
  rejectUnauthorized: false,
 },
});

export default transporter;