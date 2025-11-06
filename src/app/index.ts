import initDB from "../database/dbinit";
import init from "./app";
import https from 'node:https';
import os from "node:os";

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

function getServerIp() {
  const nets = os.networkInterfaces();
  let serverIp = "127.0.0.1";

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Check for IPv4 and skip internal (i.e. 127.0.0.1)
      if (net.family === "IPv4" && !net.internal) {
        serverIp = net.address;
        break;
      }
    }
    if (serverIp !== "127.0.0.1") break;
  }

  return serverIp;
}

console.log("Server IP is ----------- :", getServerIp());
