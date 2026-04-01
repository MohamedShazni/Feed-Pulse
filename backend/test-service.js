const { analyzeFeedback, generateTrendSummary } = require('./src/controllers/feedback.controller'); // Wait, controllers export them but service is better
const { analyzeFeedback: analyze, generateTrendSummary: summarize } = require('./src/services/gemini.service');
require('dotenv').config();

async function runTest() {
  try {
    console.log('Testing analyzeFeedback...');
    const analysis = await analyze('Slow loading times', 'The dashboard takes more than 10 seconds to load on my machine. It is very frustrating.');
    console.log('Analysis Result:', JSON.stringify(analysis, null, 2));

    console.log('\nTesting generateTrendSummary...');
    const summary = await summarize([
      { title: 'Slow load', description: 'Dashboard is slow', category: 'Bug', ai_sentiment: 'Negative' },
      { title: 'Great UI', description: 'Love the new colors', category: 'Improvement', ai_sentiment: 'Positive' }
    ]);
    console.log('Summary Result:', summary);
    
    console.log('\nAll tests passed!');
  } catch (err) {
    console.error('Test Failed:', err);
  }
}

runTest();
