import "dotenv/config";
import type { CorsOptions } from "cors";

const isLive = process.env.SERVER_URL === "https://tbkbackend.onrender.com";

const corsOptions: CorsOptions = {
 origin: isLive ? process.env.CLIENT_URL : "*",
 credentials: false
};

export default corsOptions;