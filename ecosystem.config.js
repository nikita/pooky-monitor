module.exports = {
  apps: [
    {
      name: "pooky-monitor",
      script: "./index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      exec_mode: "fork",
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
};
