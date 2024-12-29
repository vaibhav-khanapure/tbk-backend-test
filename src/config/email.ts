import "dotenv/config";
import {createTransport} from "nodemailer";

const {EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_TLS} = process.env;

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
  rejectUnauthorized: EMAIL_TLS,
 },
});

export default transporter;