import initDB from "../database/dbinit";
import init from "./app";
import https from 'node:https';

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

https.get('https://api.ipify.org?format=json', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Public IP:', JSON.parse(data).ip);
  });
});