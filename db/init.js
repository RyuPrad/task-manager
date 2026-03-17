require('dotenv').config();
const pool = require('./pool');

async function init() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT DEFAULT '',
                completed BOOLEAN DEFAULT false,    
                created_at TIMESTAMP DEFAULT NOW()
            )   
        `);

        console.log('Tasks table created successfully');

    } catch(err) {
        console.error('Error creating table: ', err.message);
    } finally {
        pool.end();
    }

    process.exit(0);
}

init();