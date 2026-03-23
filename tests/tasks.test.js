const request = require('supertest');
const app = require('../app');
const { setupTestDB, teardownTestDB, clearTask } = require('../db/test-setup');

// Run once before all test
beforeAll(async () => {
    await setupTestDB();
});

// Run before each test
beforeEach(async () => {
    await clearTask();
});

// Run once after all tests
afterAll(async () => {
    await teardownTestDB();
});

describe('POST /tasks', () => {
    test('should create a task with valid data', async() => {
        const response = await request(app)
            .post('/tasks')
            .send({ title: 'Learn jest', description: 'write some test'});

        expect(response.status).toBe(201);
        expect(response.body.title).toBe('Learn jest');
        expect(response.body.description).toBe('write some test');
        expect(response.body.completed).toBe(false);
        expect(response.body.id).toBeDefined();
        expect(response.body.created_at).toBeDefined();
    });

    test('should create a task without description', async() => {
        const response = await request(app)
            .post('/tasks')
            .send({ title: 'No description' });

        expect(response.status).toBe(201);
        expect(response.body.description).toBe('');
    });

    test('should reject a task without a title', async() => {
        const response = await request(app)
            .post('/tasks')
            .send({ description: 'Missing title'});

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
    });

    test('should reject a task with an empty title', async() => {
        const response = await request(app)
            .post('/tasks')
            .send({ title: '    '});

        expect(response.status).toBe(400);
    });
});

describe('GET /tasks', () => {
    test('should return an empty array when no tasks exist', async() => {
        const response = await request(app).get('/tasks');

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([]);
    });

    test('should return all tasks', async() => {
        // create two tasks first
        await request(app).post('/tasks').send({ title: 'task 1'});
        await request(app).post('/tasks').send({ title: 'task 2'});

        const response = await request(app).get('/tasks');

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(2);
    });
});

describe('GET /tasks/ (pagination, filtering, search)', () => {
    // Helper to create multiple tasks
    async function createTasks(tasks) {
        for (const task of tasks) {
            await request(app).post('/tasks').send(task);
        }
    }

    test('should paginate result', async() => {
        await createTasks([
            { title: 'Task 1'},
            { title: 'Task 2'},
            { title: 'Task 3'},
            { title: 'Task 4'},
            { title: 'Task 5'}
        ]);

        const response = await request(app).get('/tasks?page=1&limit=2');

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.pagination.total_tasks).toBe(5);
        expect(response.body.pagination.total_pages).toBe(3);
        expect(response.body.pagination.has_next).toBe(true);
        expect(response.body.pagination.has_prev).toBe(false);
    });

    test('should filter by completed status', async() => {
        await createTasks([
            { title: 'Done task' },
            { title: 'Open task' }
        ]);

        // Mark first task as completed
        await request(app).put('/tasks/1').send({ completed: true });

        const response = await request(app).get('/tasks?completed=true');

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].title).toBe('Done task');
    });

    test('should search by title', async() => {
        await createTasks([
            { title: 'Buy groceries' },
            { title: 'Learn Express' },
            { title: 'Grocery list' }
        ]);

        const response = await request(app).get('/tasks?search=grocer');

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(2);
    });

    test('should sort title by ascending', async() => {
        await createTasks([
            { title: 'Cherry' },
            { title: 'Apple' },
            { title: 'Banana' }
        ]);

        const response = await request(app).get('/tasks?sort=title&order=asc');

        expect(response.status).toBe(200);
        expect(response.body.data[0].title).toBe('Apple');
        expect(response.body.data[1].title).toBe('Banana');
        expect(response.body.data[2].title).toBe('Cherry');
    });

    test('should reject invalid page', async() => {
        const response = await request(app).get('/tasks?page=-1');
        expect(response.status).toBe(400);
    });

    test('should reject invalid sort column', async() => {
        const response = await request(app).get('/tasks?sort=password');
        expect(response.status).toBe(400);
    });
});

describe('GET /tasks/:id', () => {
    test('should return a single task', async() => {
        const created = await request(app)
            .post('/tasks')
            .send({ title: 'Find me'});

        const response = await request(app).get(`/tasks/${created.body.id}`);

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Find me');
    });

    test('should return a 404 for non-existent task', async() => {
        const response = await request(app).get('/tasks/9999');

        expect(response.status).toBe(404);
    });

    test('should return a 400 for invalid id', async() => {
        const response = await request(app).get('/tasks/abc');

        expect(response.status).toBe(400);
    });
});

describe('PUT /tasks/:id', () => {
    test('should update the title', async() => {
        const created = await request(app)
            .post('/tasks')
            .send({ title: 'Old title' });

        const response = await request(app)
            .put(`/tasks/${created.body.id}`)
            .send({ title: 'New title' });

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('New title');
    });

    test('should mark a task as completed', async() => {
        const created = await request(app)
            .post('/tasks')
            .send({ title: 'Complete me'});

        const response = await request(app)
            .put(`/tasks/${created.body.id}`)
            .send({ completed: true});

        expect(response.status).toBe(200);
        expect(response.body.completed).toBe(true);
    });

    test('should not change fields that are not sent', async() => {
        const created = await request(app)
            .post('/tasks')
            .send({ title: 'Keep me', description: 'Stay the same'});

        const response = await request(app)
            .put(`/tasks/${created.body.id}`)
            .send({ completed: true });

        
        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Keep me');
        expect(response.body.description).toBe('Stay the same');
    });

    test('should return 404 for a non-existent task', async() => {
        const response = await request(app)
            .put('/tasks/999')
            .send({ title: 'Ghost' });

        expect(response.status).toBe(404);
    });
});

describe('DELETE /tasks/:id', () => {
    test('should delete a task', async() => {
        const created = await request(app)
            .post('/tasks')
            .send({ title: 'Delete me'});

        const response = await request(app).delete(`/tasks/${created.body.id}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('task deleted');

        // Verify it's actualy gone
        const check = await request(app).get(`/tasks/${created.body.id}`);
        expect(check.status).toBe(404);
    });

    test(`should return a 404 for a non-existent task`, async() => {
        const response = await request(app).delete('/tasks/9999');

        expect(response.status).toBe(404);
    });
});

describe('404 handler', () => {
    test('should return 404 for unknown route', async() => {
        const response = await request(app).get('/unknown');

        expect(response.status).toBe(404);
        expect(response.body.error).toBeDefined();
    });
});

