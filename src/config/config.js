import path from 'path';
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  sessionSecret: process.env.SESSION_SECRET || 'your-secret-key',
  
  paths: {
    root: path.resolve(__dirname, '../..'),
    public: path.resolve(__dirname, '../../public'),
    images: path.resolve(__dirname, '../../public/images'),
    data: path.resolve(__dirname, '../../data'),
    views: path.resolve(__dirname, '../../views')
  },

  upload: {
    maxFileSize: 15 * 1024 * 1024, // 15MB
    maxFiles: 10,
    allowedTypes: ['.jpg', '.jpeg', '.png', '.gif']
  },

  session: {
    cookie: {
      maxAge: 3600000, // 1 hour
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict'
    }
  },

  security: {
    csrf: {
      enabled: true,
      ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
      ignorePaths: ['/api/webhook']
    }
  }
};

export default config;