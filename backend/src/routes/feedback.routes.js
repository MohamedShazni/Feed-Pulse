const express = require('express');
const {
  createFeedback,
  getFeedbacks,
  getFeedback,
  updateFeedbackStatus,
  deleteFeedback,
  getTrendSummary,
  reanalyzeFeedback
} = require('../controllers/feedback.controller');
const { protect } = require('../middlewares/auth.middleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for public feedback submission: prevent same IP submitting more than 5 times per hour
const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many feedbacks created from this IP, please try again after an hour'
});

// Public route
router.post('/', submissionLimiter, createFeedback);

// Protected Admin routes
router.use(protect);

router.get('/summary', getTrendSummary);
router.get('/', getFeedbacks);
router.get('/:id', getFeedback);
router.patch('/:id', updateFeedbackStatus);
router.delete('/:id', deleteFeedback);
router.post('/:id/reanalyze', reanalyzeFeedback);

module.exports = router;
