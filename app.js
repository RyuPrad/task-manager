const path = require('path');
require('dotenv').config({
    path: path.resolve(__dirname, process.env.NODE_ENV === 'test' ? '.env.test' : '.env')
});

const express = require('express');
const helmet = require('helmet');
const logger = require('./middleware/logger');
const configureCors = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');
const taskRoutes = require('./routes/tasks');
const limiter = require('./middleware/rateLimiter');

const app = express();

app.use(helmet());
app.use(configureCors());
app.use(limiter);

app.use(express.json({ limit: '10kb' }));

app.use(logger);

app.use('/tasks', taskRoutes);

app.use((req, res) => {
    res.status(404).json({ error: `Router ${req.url} ${req.method} not found`});
});

app.use(errorHandler);

module.exports = app;