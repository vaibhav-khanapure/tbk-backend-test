import tboTokenGeneration from "../utils/tboTokenGeneration";
import initDB from "../database/dbinit";
import init from "./app";
import cronTokenGenerator from "../utils/cronTokenGenerator";

// cronTokenGenerator();
const server = async () => {
 try {
  await initDB();
  init();
 } catch (error: any) {
  console.log("SOME ERROR OCCURRED", error?.message);
 };
};

server();