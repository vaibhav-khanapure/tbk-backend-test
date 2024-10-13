import {defineConfig} from "tsup";

export default defineConfig({
 entry: ["./src/app/index.ts"],
 format: ["cjs"],
 outDir: "dist",
 minify: true,
 clean: true,
 target: "es2022",
 watch: true,
 onSuccess: "nodemon dist/index.js",
});