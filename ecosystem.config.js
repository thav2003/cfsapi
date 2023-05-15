module.exports = {
  apps : [
    {
      name: 'cfsapi-dev',
      script: 'build/src/app.js',
      instances: 'max',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3334,
      },
    },
  ],
};
