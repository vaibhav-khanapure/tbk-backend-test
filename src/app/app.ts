import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import {createServer} from "https";
import morgan from "morgan";
import errorHandler from "../middlewares/errorHandler";
import API from "../routes/API";
import {readFileSync} from "fs";
import path from "path";
import compression from "compression";

const PORT = process.env.PORT || 8000;

const app = express();

app.use(express.json());
app.use(cors({
 origin: process.env.CLIENT_URL,
 credentials: true
}));

// Using GZIP Compression
app.use(compression());

// Logger during development
if(process.env.NODE_ENV === "development") app.use(morgan("tiny"));

// Headers Security
app.use(helmet());

// Access Images
app.use("/images", express.static(path.join(process.cwd(), 'src/public/images')));

// API Routes
app.use("/api/v1", API);

// Invalid API Routes
app.all("*", (_, res) => res.status(404).json({message: "Invalid route"}));

// Error Handler
app.use(errorHandler);

// Initialize Server
const init = () => {
 if(process.env.NODE_ENV === "production") {
  const server = createServer({
    key: readFileSync("/etc/letsencrypt/live/lfix.us/privkey.pem"),
    cert: readFileSync("/etc/letsencrypt/live/lfix.us/fullchain.pem"),
   },
   app,
  );

  server.listen(PORT, () => console.log(`running in production on port ${PORT}`));
 } else {
  const host = app.listen(PORT, () => console.log(`> http://localhost:${PORT}`));
  process.on("SIGTERM", () => host.close());
 };
};

export default init;