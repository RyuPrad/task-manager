const cors = require('cors');

function configureCors() {
    if (process.env.NODE_ENV === 'production') {
        // In production, only allow my frontend
        return cors({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        });
    }
    // In development, allow everything
    return cors();
}

module.exports = configureCors;