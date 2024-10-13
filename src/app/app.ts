import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import errorHandler from "../middlewares/errorHandler";

const port = process.env.PORT || 8000;

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
app.use(helmet());

app.all("*", (_, res) => res.status(404).json({message: "Invalid route"}));

app.use(errorHandler);

function init() {
 const host = app.listen(port, () => console.log(`> http://localhost:${port}`));
 process.on("SIGTERM", () => host.close());
};

export default init;