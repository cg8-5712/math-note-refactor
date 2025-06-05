import crypto from 'crypto';

const adminConfig = {
  // Password: "admin123" (you should change this)
  passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  verifyPassword: (password) => {
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    return hash === adminConfig.passwordHash;
  }
};

module.exports = adminConfig;