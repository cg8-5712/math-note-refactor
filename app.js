const express = require('express');
const configureExpress = require('./src/config/express');
const errorHandler = require('./src/middleware/errorHandler');

// Initialize app
const app = express();

// Configure Express with all middleware
configureExpress(app);

// Routes
app.use('/', require('./src/routes/index'));
app.use('/admin', require('./src/routes/admin'));

// Error handling
app.use(errorHandler);

module.exports = app;