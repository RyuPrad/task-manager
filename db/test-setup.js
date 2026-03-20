const pool = require('./pool');

async function setupTestDB() {
    await pool.query(`
        DROP TABLE IF EXISTS tasks;
        CREATE TABLE tasks (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT DEFAULT '',
            completed BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT NOW()
        )
    `);
}

async function teardownTestDB() {
    await pool.query('DROP TABLE IF EXISTS tasks');
    await pool.end();
}

async function clearTask() {
    await pool.query('DELETE FROM tasks');
    await pool.query('ALTER SEQUENCE tasks_id_seq RESTART WITH 1');
}

module.exports = { setupTestDB, teardownTestDB, clearTask };