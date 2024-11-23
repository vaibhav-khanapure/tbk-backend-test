import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import {createServer} from "https";
import morgan from "morgan";
import errorHandler from "../middlewares/errorHandler";
import API from "../routes/API";
import {readFileSync} from "fs";

const PORT = process.env.PORT || 8000;

const app = express();

app.use(express.json());
app.use(cors({
 origin: process.env.CLIENT_URL,
 credentials: true
}));
app.use(morgan("tiny"));
app.use(helmet());

app.use("/api/v1", API);

app.all("*", (_, res) => res.status(404).json({message: "Invalid route"}));

app.use(errorHandler);

function init() {
 if(process.env.NODE_ENV === "production") {
  const server = createServer(
   {
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