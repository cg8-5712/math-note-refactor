const express = require('express');
const session = require('express-session');
const path = require('path');
const configureExpress = require('./src/config/express');

// Initialize express app
const app = express();

// Load configurations
configureExpress(app);

// Configure session before routes
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Routes
app.use('/', require('./src/routes/index'));
app.use('/admin', require('./src/routes/admin'));

// Error handler
app.use(require('./src/middleware/errorHandler'));

module.exports = app;