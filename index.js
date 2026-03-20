const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
});