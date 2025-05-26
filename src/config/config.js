const path = require('path');

module.exports = {
  env: 'development',
  port: 3000,
  sessionSecret: 'your-secret-key',
  uploadDir: path.join(__dirname, '../../public/images'),
  dataDir: path.join(__dirname, '../../data'),
  maxFileSize: 15 * 1024 * 1024, // 15MB
  allowedFileTypes: ['.jpg', '.jpeg', '.png', '.gif'],
  session: {
    cookie: {
      maxAge: 3600000, // 1小时
      secure: false,
      httpOnly: true,
      sameSite: 'strict'
    }
  }
};