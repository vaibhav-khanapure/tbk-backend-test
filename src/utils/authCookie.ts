import "dotenv/config";
import type {CookieOptions} from "express";

const authCookieOptions: CookieOptions = {
 sameSite: "lax",
 httpOnly: true,
 path: "/",
 secure: process.env.NODE_ENV === "production",
 domain: process.env.CLIENT_DOMAIN,
};

export default authCookieOptions;