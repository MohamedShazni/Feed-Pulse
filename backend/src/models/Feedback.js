const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [120, 'Title cannot exceed 120 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [20, 'Description must be at least 20 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Bug', 'Feature Request', 'Improvement', 'Other'],
      message: '{VALUE} is not a valid category'
    }
  },
  status: {
    type: String,
    enum: ['New', 'In Review', 'Resolved'],
    default: 'New'
  },
  submitterName: {
    type: String,
    trim: true
  },
  submitterEmail: {
    type: String,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  // AI fields - populated after Gemini responds
  ai_category: String,
  ai_sentiment: {
    type: String,
    enum: ['Positive', 'Neutral', 'Negative']
  },
  ai_priority: {
    type: Number,
    min: 1,
    max: 10
  },
  ai_summary: String,
  ai_tags: [String],
  ai_processed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add MongoDB indexes on: status, category, ai_priority, and createdAt for query performance
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ ai_priority: -1 }); // Typically want highest priority first
feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
