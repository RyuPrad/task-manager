require('dotenv').config();
const pool = require('./pool');

async function migrate() {
    try {
        await pool.query(`
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'
        `);

        // Remove the default after adding the column
        await pool.query(`
            ALTER TABLE tasks
            ALTER COLUMN user_id DROP DEFAULT
        `);

        // Create an index for faste lookups by user
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)    
        `);

        console.log('Migration complete: added user_id to tasks');
    } catch (err) {
        console.error('Migration error:', err.message);
    } finally {
        pool.end()
        process.exit(0);
    }
}

migrate();