import "dotenv/config";
import type { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
 origin: ["http://localhost:3000", process.env.CLIENT_URL as string],
 credentials: false
};

export default corsOptions;