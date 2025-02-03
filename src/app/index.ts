import initDB from "../database/dbinit";
import init from "./app";

const server = async () => {
 try {
  await initDB();
  init();
 } catch (err) {
  const error = err as Error;
  console.log("SOME ERROR OCCURRED", error?.message);
 };
};

server();