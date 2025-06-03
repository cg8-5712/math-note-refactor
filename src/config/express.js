const express = require('express');
const session = require('express-session');
const csrf = require('csurf');
const helmet = require('helmet');
const flash = require('connect-flash');
const path = require('path');
const config = require('./config');

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
        upgradeInsecureRequests: null // Remove this in development
      }
    }
  }));

  // Add additional headers for development
  if (process.env.NODE_ENV !== 'production') {
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
      secure: process.env.NODE_ENV === 'production',
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
    
    // Add CSRF token to response headers for XHR requests
    res.set('X-CSRF-Token', req.csrfToken());
    next();
  });

  return app;
};

module.exports = configureExpress;