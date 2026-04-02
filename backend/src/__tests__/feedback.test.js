const request = require('supertest');
const app = require('../../server');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Mock Gemini Service
jest.mock('../services/gemini.service', () => ({
  analyzeFeedback: jest.fn().mockResolvedValue({
    category: 'Feature Request',
    sentiment: 'Positive',
    priority_score: 8,
    summary: 'Mocked AI summary',
    tags: ['ui', 'ux']
  })
}));

describe('Feedback Endpoints', () => {
  let token;

  beforeAll(async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123'
    });
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'test_secret');
  });

  test('POST /api/feedback - valid submission saves to DB', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .send({
        title: 'New dark mode request',
        description: 'Please add a dark mode to the dashboard, it would be great.',
        category: 'Feature Request'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('New dark mode request');
    
    // Check if saved to DB
    const feedback = await Feedback.findOne({ title: 'New dark mode request' });
    expect(feedback).toBeTruthy();
  });

  test('POST /api/feedback - rejects empty title (validation)', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .send({
        description: 'Testing without a title field.',
        category: 'Bug'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('PATCH /api/feedback/:id - status update works correctly', async () => {
    const feedback = await Feedback.create({
      title: 'Patch testing item',
      description: 'This is a description for testing patch updates.',
      category: 'Improvement'
    });

    const res = await request(app)
      .patch(`/api/feedback/${feedback._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'In Review'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('In Review');
    
    const updated = await Feedback.findById(feedback._id);
    expect(updated.status).toBe('In Review');
  });
});
