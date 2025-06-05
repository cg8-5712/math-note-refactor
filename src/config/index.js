import config from './config.js';

export default {
  ...config,
  env: process.env.NODE_ENV || config.env,
  port: process.env.PORT || config.port,
  sessionSecret: process.env.SESSION_SECRET || config.sessionSecret
};