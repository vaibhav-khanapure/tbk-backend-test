import "dotenv/config";
import type { CorsOptions } from "cors";

const isLive = process.env.SERVER_URL === "https://tbkbackend.onrender.com";

const origin = [process.env.CLIENT_URL as string, "https://tbkadmin3.zendsoft.com"];

const corsOptions: CorsOptions = {
//  origin: isLive ? origin : "*",
 origin: "*",
 credentials: false
};

export default corsOptions;