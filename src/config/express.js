const express = require('express');
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');
const csrf = require('csurf');
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
        connectSrc: ["'self'"]
      }
    }
  }));

  // Session configuration - Must come before CSRF
  app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      ...config.session.cookie,
      secure: process.env.NODE_ENV === 'production'
    }
  }));

  // CSRF Protection
  const csrfProtection = csrf({
    cookie: false
  });

  app.use(csrfProtection);

  // Add CSRF token to responses
  app.use((req, res, next) => {
    // Store token in res.locals for views
    res.locals.csrfToken = req.csrfToken();

    // Wrap json method to include token
    const originalJson = res.json;
    res.json = function(data) {
      return originalJson.call(this, {
        ...data,
        csrfToken: req.csrfToken()
      });
    };

    next();
  });

  return app;
};
module.exports = configureExpress;