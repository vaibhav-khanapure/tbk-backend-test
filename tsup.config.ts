import {defineConfig} from "tsup";
import "dotenv/config";

const outDirPath: string = "dist";
const isProd = process.env.NODE_ENV === "production";
const cmd = isProd ? "NODE_ENV=production node dist/index.js" : "node dist/index.js";

if(!outDirPath || outDirPath === "/" || typeof outDirPath !== "string") {
 throw new Error("outDirPath must be valid");
};

export default defineConfig({
 entry: ["./src/app/index.ts"],
 format: ["cjs"],
 outDir: outDirPath,
 minify: true,
 clean: true,
 target: "es2022",
 watch: true,
 onSuccess: cmd,
});