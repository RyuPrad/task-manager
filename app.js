const path = require('path');
require('dotenv').config({
    path: path.resolve(__dirname, process.env.NODE_ENV === 'test' ? '.env.test' : '.env')
});

const express = require('express');
const helmet = require('helmet');
const logger = require('./middleware/logger');
const configureCors = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');
const limiter = require('./middleware/rateLimiter');
const taskRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth');

const app = express();

// Security middleware
app.use(helmet());
app.use(configureCors());
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));

// Logging
app.use(logger);

// Routes
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Error handler
app.use(errorHandler);

module.exports = app;