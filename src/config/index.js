const path = require('path');
const config = require('./config');

// 导出配置，优先使用环境变量
module.exports = {
  ...config,
  env: process.env.NODE_ENV || config.env,
  port: process.env.PORT || config.port,
  sessionSecret: process.env.SESSION_SECRET || config.sessionSecret
};