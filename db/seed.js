require('dotenv').config();
const pool = require('./pool');

const sampleTasks = [
  { title: 'Buy groceries', description: 'Milk, eggs, bread, butter' },
  { title: 'Learn Express', description: 'Build a REST API' },
  { title: 'Walk the dog', description: 'At least 30 minutes' },
  { title: 'Read a book', description: 'Finish chapter 5' },
  { title: 'Clean the kitchen', description: 'Dishes and countertops' },
  { title: 'Write blog post', description: 'About Node.js testing' },
  { title: 'Fix login bug', description: 'Users getting 403 error' },
  { title: 'Update dependencies', description: 'Run npm audit fix' },
  { title: 'Grocery list for party', description: 'Chips, drinks, napkins' },
  { title: 'Deploy to production', description: 'Push v1.0 to Railway' },
  { title: 'Review pull request', description: 'Check the auth refactor' },
  { title: 'Call dentist', description: 'Schedule cleaning appointment' },
  { title: 'Prepare presentation', description: 'Slides for Friday meeting' },
  { title: 'Learn PostgreSQL', description: 'Practice complex queries' },
  { title: 'Organize desk', description: 'File papers, clean monitor' },
];

async function seed() {
    try {
        // Mark some as completed for filter testing
        for (let i = 0; i < sampleTasks.length; i++) {
            const task = sampleTasks[i];
            const completed = i % 3 === 0; // every 3rd task is completed

            await pool.query(
                'INSERT INTO TASKS(title, description, completed) VALUES ($1, $2, $3)',
                [task.title, task.description, completed]
            );
        }

        console.log(`Seeded ${sampleTasks.length} tasks`);
    } catch (err) {
        console.error('Seeding error:', err.message);
    } finally {
        pool.end();
        process.exit(0);
    }
}

seed();