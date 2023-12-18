module.exports = {
  apps: [
    {
      name: 'kdong-api',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster'
    }
  ]
};
