const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Re-map requirements to absolute paths to avoid issues
dotenv.config({ path: path.resolve(__dirname, '.env') });
const Feedback = require('./src/models/Feedback');
const { analyzeFeedback } = require('./src/services/gemini.service');

async function reprocessPending() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const pending = await Feedback.find({ ai_processed: false });
    console.log(`Found ${pending.length} pending feedbacks.`);

    for (const fb of pending) {
      console.log(`Processing ID: ${fb._id} - ${fb.title}`);
      try {
        const aiAnalysis = await analyzeFeedback(fb.title, fb.description);
        if (aiAnalysis) {
          fb.ai_category = aiAnalysis.category;
          fb.ai_sentiment = aiAnalysis.sentiment;
          fb.ai_priority = aiAnalysis.priority_score;
          fb.ai_summary = aiAnalysis.summary;
          fb.ai_tags = aiAnalysis.tags;
          fb.ai_processed = true;
          await fb.save();
          console.log(`Successfully processed: ${fb._id}`);
        }
      } catch (err) {
        console.error(`Failed to process ${fb._id}:`, err.message);
      }
    }

    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('Migration Error:', error);
    process.exit(1);
  }
}

reprocessPending();
