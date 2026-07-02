// PM2 process manager config — keeps the app running & auto-restarts.
// Start on the VPS with:  pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "events-lk",
      // Runs the standalone server produced by `output: "standalone"`
      script: ".next/standalone/server.js",
      cwd: "/var/www/events-lk",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      max_memory_restart: "500M",
      autorestart: true,
    },
  ],
};
