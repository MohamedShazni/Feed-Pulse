const request = require('supertest');
const app = require('../../server');
const User = require('../models/User');

describe('Auth Middleware', () => {
  test('protect - protected route /api/feedback (GET) rejects unauthenticated request', async () => {
    const res = await request(app).get('/api/feedback');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
