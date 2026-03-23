function logger(req, res, next) {
    // Skip logging on npm test
    if (process.env.NODE_ENV === 'test') return next();

    const timestamp = new Date().toISOString();
    console.log(`${timestamp} ${req.method} ${req.url}`);

    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`request speed => ${duration}ms`);
    });

    next();
}

module.exports = logger;