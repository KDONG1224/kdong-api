module.exports = {
  apps: [
    {
      name: 'kdong-api',
      script: 'node dist/main',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
