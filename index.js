require('dotenv').config();

const express = require('express');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(logger);

app.use('/tasks', taskRoutes);

app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found`});
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`server on http://${PORT}`);
});