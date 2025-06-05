import express from 'express';
import session from 'express-session';
import csrf from 'csurf';
import helmet from 'helmet';
import flash from 'connect-flash';
import path from 'path';
import { dirname } from "path";
import { fileURLToPath } from "url";
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 定义环境相关常量
const ENV = {
  MODE: import.meta.env?.MODE || 'development',
  PROD: import.meta.env?.PROD || false,
  DEV: import.meta.env?.DEV || true
};

const configureExpress = (app) => {
  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, '../../public')));

  // View engine setup
  app.set('views', path.join(__dirname, '../../views'));
  app.set('view engine', 'pug');

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "cdn.jsdelivr.net", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
        upgradeInsecureRequests: ENV.PROD ? [] : null
      }
    }
  }));

  // Add additional headers for development
  if (!ENV.PROD) {
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
      next();
    });
  }

  // Session configuration
  app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
    cookie: {
      httpOnly: true,
      secure: ENV.PROD,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Flash messages
  app.use(flash());

  // CSRF Protection
  app.use(csrf({
    cookie: false
  }));

  // Add CSRF token to response locals and set security headers
  app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    res.locals.isAuthenticated = req.session.isAuthenticated || false;
    res.set('X-CSRF-Token', req.csrfToken());
    next();
  });

  return app;
};

export default configureExpress;