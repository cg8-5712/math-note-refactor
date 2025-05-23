const express = require('express');
const session = require('express-session');
const path = require('path');
const helmet = require('helmet');
const csrf = require('csurf');
const configureExpress = require('./src/config/express');
const errorHandler = require('./src/middleware/errorHandler');

// Initialize express app
const app = express();

// Load configurations
configureExpress(app);

// Security middleware
app.use(helmet());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 3600000
  }
}));

// CSRF protection
app.use(csrf());

// Routes
app.use('/', require('./src/routes/index'));
app.use('/admin', require('./src/routes/admin'));

// Error handler must be last
app.use(errorHandler);

module.exports = app;