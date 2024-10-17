import initDB from "../database/dbinit";
import init from "./app";

async function server() {
 try {
  await initDB();
  init();
 } catch (error: any) {
  console.log("SOME ERROR OCCURRED", error?.message);  
 }
};

server();