const { Pool } = require('pg');

const pool = new Pool ({
    connectionString: process.env.DATABASE_URL
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Failed to connect to database:', err.message);
    } else {
        console.log('Database connected at:', res.rows[0].now);
    }
}) ;

module.exports = pool;
