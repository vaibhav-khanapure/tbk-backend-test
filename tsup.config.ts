import {defineConfig} from "tsup";

const outDirPath: string = "dist";

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
 onSuccess: "nodemon dist/index.js",
});