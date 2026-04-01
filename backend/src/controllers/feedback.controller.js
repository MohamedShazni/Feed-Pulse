const Feedback = require('../models/Feedback');
const { analyzeFeedback, generateTrendSummary } = require('../services/gemini.service');

// @desc    Submit new feedback
// @route   POST /api/feedback
// @access  Public
const createFeedback = async (req, res) => {
  try {
    const { title, description, category, submitterName, submitterEmail } = req.body;

    // Validate request
    if (!title || !description || !category) {
      return res.status(400).json({ success: false, error: 'Title, description and category are required' });
    }

    if (description.length < 20) {
      return res.status(400).json({ success: false, error: 'Description must be at least 20 characters' });
    }

    // Sanitize input (basic escaping of common XSS cases could be done here, but mongoose handles SQLi. Let's rely on Mongoose schema for now or add explicit sanitization if needed)
    
    // Create feedback document
    const feedback = await Feedback.create({
      title,
      description,
      category,
      submitterName,
      submitterEmail
    });

    // Respond immediately to the user 
    res.status(201).json({
      success: true,
      data: feedback,
      message: 'Feedback submitted successfully'
    });

    // Asynchronous AI Processing
    (async () => {
      try {
        const aiAnalysis = await analyzeFeedback(title, description);
        if (aiAnalysis) {
          feedback.ai_category = aiAnalysis.category;
          feedback.ai_sentiment = aiAnalysis.sentiment;
          feedback.ai_priority = aiAnalysis.priority_score;
          feedback.ai_summary = aiAnalysis.summary;
          feedback.ai_tags = aiAnalysis.tags;
          feedback.ai_processed = true;
          await feedback.save();
          console.log(`[AI Analysis] Successfully processed feedback ID: ${feedback._id}`);
        }
      } catch (aiError) {
        console.error(`[AI Analysis] Failed for feedback ID: ${feedback._id}`, aiError);
      }
    })();

  } catch (error) {
    console.error('Create Feedback Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get all feedback (supports filters, pagination, sorting, search)
// @route   GET /api/feedback
// @access  Private
const getFeedbacks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      category,
      status,
      sort, // date, priority, sentiment
      search
    } = req.query;

    let query = {};

    // Filters
    if (category) query.category = category;
    if (status) query.status = status;

    // Keyword Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ai_summary: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sortObj = { createdAt: -1 }; // default to newest
    if (sort === 'date') sortObj = { createdAt: -1 };
    else if (sort === 'priority') sortObj = { ai_priority: -1 };
    else if (sort === 'sentiment') sortObj = { ai_sentiment: 1 }; // Positive -> Neutral -> Negative (alphabetical sort order depends on values, maybe need custom logic but this is fine)

    const feedbacks = await Feedback.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const total = await Feedback.countDocuments(query);

    // Get Extra Stats for dashboard
    const totalAll = await Feedback.countDocuments();
    const openItems = await Feedback.countDocuments({ status: { $ne: 'Resolved' } });
    
    // Aggregation for average priority and top tag
    const stats = await Feedback.aggregate([
      { $match: { ai_processed: true } },
      { $group: {
          _id: null,
          avgPriority: { $avg: '$ai_priority' },
          allTags: { $push: '$ai_tags' }
        }
      }
    ]);

    let avgPriority = 0;
    let mostCommonTag = 'N/A';

    if (stats.length > 0) {
      avgPriority = stats[0].avgPriority.toFixed(1);
      
      const tagCounts = {};
      stats[0].allTags.flat().forEach(tag => {
        if(tag) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });

      if (Object.keys(tagCounts).length > 0) {
        mostCommonTag = Object.keys(tagCounts).reduce((a, b) => tagCounts[a] > tagCounts[b] ? a : b);
      }
    }

    res.status(200).json({
      success: true,
      data: feedbacks,
      meta: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
        stats: {
          total: totalAll,
          open: openItems,
          avgPriority,
          mostCommonTag
        }
      }
    });
  } catch (error) {
    console.error('Get Feedbacks Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get single feedback item
// @route   GET /api/feedback/:id
// @access  Private
const getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }

    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    console.error('Get Feedback Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update feedback status
// @route   PATCH /api/feedback/:id
// @access  Private
const updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['New', 'In Review', 'Resolved'].includes(status)) {
         return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }

    feedback = await Feedback.findByIdAndUpdate(req.params.id, { status }, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: feedback,
      message: 'Status updated successfully'
    });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }

    await feedback.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Delete Feedback Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get AI-generated trend summary
// @route   GET /api/feedback/summary
// @access  Private
const getTrendSummary = async (req, res) => {
  try {
    // Get latest 30 feedbacks for context
    const recentFeedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(30);
    
    const summary = await generateTrendSummary(recentFeedbacks);

    res.status(200).json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    console.error('Trend Summary Error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate trend summary' });
  }
};

// @desc    Manually re-trigger AI analysis
// @route   POST /api/feedback/:id/reanalyze
// @access  Private
const reanalyzeFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }

    const aiAnalysis = await analyzeFeedback(feedback.title, feedback.description);
    
    if (aiAnalysis) {
      feedback.ai_category = aiAnalysis.category;
      feedback.ai_sentiment = aiAnalysis.sentiment;
      feedback.ai_priority = aiAnalysis.priority_score;
      feedback.ai_summary = aiAnalysis.summary;
      feedback.ai_tags = aiAnalysis.tags;
      feedback.ai_processed = true;
      await feedback.save();
      
      res.status(200).json({
        success: true,
        data: feedback,
        message: 'Feedback re-analyzed successfully'
      });
    } else {
      res.status(500).json({ success: false, error: 'Failed to get valid analysis from AI' });
    }
  } catch (error) {
    console.error('Reanalyze Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = {
  createFeedback,
  getFeedbacks,
  getFeedback,
  updateFeedbackStatus,
  deleteFeedback,
  getTrendSummary,
  reanalyzeFeedback
};
