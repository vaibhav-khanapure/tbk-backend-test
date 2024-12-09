module.exports = {
 apps: [
  {
   name: "tbk-backend",
   script: "./dist/index.js",
   instances: "max", // Or a specific number of instances
   exec_mode: "cluster", // Enables clustering
   watch: true, // Restarts the app on file changes
   env: {
    NODE_ENV: "development",
   },
   env_production: {
    NODE_ENV: "production",
   },
  },
 ],
};