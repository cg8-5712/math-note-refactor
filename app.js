import express from 'express';
import configureExpress from './src/config/express.js';
import errorHandler from './src/middleware/errorHandler.js';
import indexRoutes from './src/routes/index.js';
import adminRoutes from './src/routes/admin.js';

// Initialize app
const app = express();

// Configure Express with all middleware
configureExpress(app);

// Routes
app.use('/', indexRoutes);
app.use('/admin', adminRoutes);

// Error handling
app.use(errorHandler);

export default app;