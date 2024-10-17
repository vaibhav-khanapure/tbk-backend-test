import initDB from "../database/dbinit";
import tokenGenerator from "../utils/tokenGenerator";
import init from "./app";

// tokenGenerator();

async function server() {
 try {
  await initDB();
  init();
 } catch (error: any) {
  console.log("SOME ERROR OCCURRED", error?.message);  
 };
};

server();