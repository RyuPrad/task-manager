const request = require('supertest');

// Don't mock auth here - we to test the real middleware
const app = require('../app');

describe('Authentication', () => {
    test('should reject requests without token', async () => {
        const response = await request(app).get('/tasks');

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('No token provided');
    });

    test('should reject requests with an invalid token', async () => {
        const response = await request(app)
            .get('/tasks')
            .set('Authorization', 'Bearer fake-token-12345');

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Invalid or expired token');
    });

    test('should reject requests with malformed auth header', async() => {
        const response = await request(app)
            .get('/tasks')
            .set('Authorization', 'NotBearer some-token');

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('No token provided');
    });
});