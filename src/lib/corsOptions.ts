import "dotenv/config";
import type { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
 origin: process.env.CLIENT_URL,
 credentials: false
};

export default corsOptions;