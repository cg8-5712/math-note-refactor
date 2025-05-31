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
    cookie: config.session.cookie
  }));

  // Initialize CSRF protection
  const csrfMiddleware = csrf({ 
    cookie: false
  });
  
  app.use((req, res, next) => {
    csrfMiddleware(req, res, (err) => {
      if (err && err.code === 'EBADCSRFTOKEN') {
        console.error('CSRF Error:', err, 'Headers:', req.headers);
        return res.status(403).json({
          error: 'Invalid CSRF token',
          message: '请刷新页面重试'
        });
      }
      next(err);
    });
  });

  // Add CSRF token to all responses
  app.use((req, res, next) => {
    const token = req.csrfToken();
    res.locals.csrfToken = token;
    
    // Store original methods
    const originalJson = res.json;
    const originalSend = res.send;
    
    // Override json method
    res.json = function(data) {
      const responseData = {
        ...data,
        csrfToken: token
      };
      return originalJson.call(this, responseData);
    };
    
    // Override send method for non-JSON responses
    res.send = function(data) {
      if (typeof data === 'object' && !Buffer.isBuffer(data)) {
        return res.json(data);
      }
      return originalSend.call(this, data);
    };
    
    next();
  });

  // Error handler
  app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
      return res.status(403).json({
        error: 'Invalid CSRF token',
        message: '请刷新页面重试'
      });
    }
    next(err);
  });

  return app;
};

module.exports = configureExpress;