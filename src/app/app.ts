import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer, type ServerOptions } from "https";
import morgan from "morgan";
import errorHandler from "../middlewares/errorHandler";
import API from "../routes/API";
import { readFileSync } from "fs";
import path from "path";
import compression from "compression";
import cronTokenGenerator from "../utils/cronTokenGenerator";
import rateLimit from "express-rate-limit";
import corsOptions from "../lib/corsOptions";
import gracefulShutdown from "../helpers/gracefulShutdown";
import Settings from "../database/tables/settingsTable";
import { fixflyTokenPath } from "../config/paths";
import { writeFile } from "fs/promises";
import tboTokenGeneration from "../utils/tboTokenGeneration";
import verifyOrigin from "../middlewares/verifyOrigin";
import cronHotelAccessTokenGenerator from "../utils/cronHotelAccessTokenGenerator";
import cronHotelRefreshTokenGenerator from "../utils/cronHotelRefreshTokenGenerator";

// try adding cluster
const PORT = process.env.PORT || 8000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

// Verify Origin // This will block all the other resources except tbkclient
// app.use(verifyOrigin);

// Using GZIP Compression
app.use(compression());

// Caching
app.set('etag', true);

// Disable info
app.disable('x-powered-by');

// Trust proxy if behind a reverse proxy
app.set('trust proxy', 1);

// Rate Limiter
// const limiter = rateLimit({
//  windowMs: 1 * 60 * 1000,
//  max: 1000 * 10,
// });

// app.use(limiter);

// Logger during development
if (process.env.NODE_ENV === "development") {
    app.use(morgan("tiny"));
};

// Headers Security - import from lib
app.use(helmet());

// Access Images
app.use("/api/v1/images", express.static(path.join(process.cwd(), 'src/public/images')));

// API Routes
app.all("/", (_, res) => res.status(200).json({ message: "Server working" }));
app.use("/api/v1", API);

app.get("/health", (req, res) => {
    return res.status(200).json({
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
    });
});

// Invalid API Routes
app.all("*", (_, res) => res.status(404).json({ message: "Invalid route" }));

// Error Handler
app.use(errorHandler);

// Initialize Server
const init = async () => {
 try {
  cronTokenGenerator();
  cronHotelAccessTokenGenerator();
  cronHotelRefreshTokenGenerator();

  const token = await Settings.findOne({
   where: { key: "fixflyToken" },
   raw: true
  });

  if (token?.value) await writeFile(fixflyTokenPath, token?.value)
  else await tboTokenGeneration();

  if (process.env.NODE_ENV === "production") {
   // server options for production
   const serverOptions: ServerOptions = {
    key: readFileSync("/etc/letsencrypt/live/lfix.us/privkey.pem"),
    cert: readFileSync("/etc/letsencrypt/live/lfix.us/fullchain.pem"),
   };

   const server = createServer(serverOptions, app);

   gracefulShutdown(server);
   server.listen(PORT, () => console.log(`Running in production on port ${PORT}`));
  } else {
   const host = app.listen(PORT, () => console.log(`> http://localhost:${PORT}`));
   process.on("SIGTERM", () => host.close(() => process.exit(0)));
  };
 } catch (error: any) {
  console.log("APP ERROR", error?.message);
 };
};

export default init;