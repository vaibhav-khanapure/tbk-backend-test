import type {Server} from "https";

const gracefulShutdown = (server: Server) => {
 process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Performing graceful shutdown...');

  server.close(() => {
   console.log('Server closed. Exiting process...');
   process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
   console.log('Could not close connections in time. Forcefully shutting down');
   process.exit(1);
  }, 30000);
 });
};

export default gracefulShutdown;