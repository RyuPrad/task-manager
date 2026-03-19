require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const logger = require('./middleware/logger');
const configureCors = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');
const limiter = require('./middleware/rateLimiter');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(configureCors());
app.use(limiter)


app.use(express.json({ limit: '10kb' }));

app.use(logger);

app.use('/tasks', taskRoutes);

app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.url} ${req.method} does not exist`});
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://${PORT}`);
});
