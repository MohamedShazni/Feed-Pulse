const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
const getAI = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      console.error('[AI SDK] Critical: GEMINI_API_KEY is not defined!');
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    console.log(`[AI SDK] Initializing stable client with prefix: ${process.env.GEMINI_API_KEY.substring(0, 4)}...`);
    try {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    } catch (err) {
      console.error('[AI SDK] Constructor Failure:', err.message);
      throw err;
    }
  }
  return genAI;
};

const analyzeFeedback = async (title, description) => {
  try {
    const prompt = `Analyse this product feedback. Return ONLY valid JSON with these fields: category, sentiment, priority_score (1-10), summary, tags.
Feedback Title: ${title}
Feedback Description: ${description}

Strictly reply with valid JSON format only, without markdown code block delimiters.
Schema:
{
  "category": "String (Bug | Feature Request | Improvement | Other)",
  "sentiment": "String (Positive | Neutral | Negative)",
  "priority_score": "Number (1 to 10)",
  "summary": "String",
  "tags": ["String", "String"]
}`;

    // Call the gemini-3-flash-preview model
    console.log('[AI Analysis] Sending request to models/gemini-3-flash-preview...');
    const model = getAI().getGenerativeModel({ 
      model: 'models/gemini-3-flash-preview',
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('[AI Analysis] Received response length:', text ? text.length : 0);
    if (!text) {
      throw new Error('No text returned from Gemini API');
    }

    // Try to parse JSON response
    const analysis = JSON.parse(text);
    return analysis;

  } catch (error) {
    console.error('Gemini API Analysis Error:', error.message);
    throw error;
  }
};

const generateTrendSummary = async (feedbackList) => {
  try {
    if (!feedbackList || feedbackList.length === 0) {
      return 'No feedback available to summarize.';
    }

    const feedbacksContext = feedbackList.map(f => `- ${f.title}: ${f.ai_summary || f.description} (Category: ${f.category}, Sentiment: ${f.ai_sentiment})`).join('\n');

    const prompt = `Analyze these recent product feedbacks and generate a weekly/on-demand AI summary. 
Format your response as a concise paragraph highlighting the "Top 3 themes".
Keep it professional, clear, and actionable.

Feedbacks:
${feedbacksContext}`;

    console.log('[AI Trend Summary] Sending request to models/gemini-3-flash-preview...');
    const model = getAI().getGenerativeModel({ model: 'models/gemini-3-flash-preview' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('[AI Trend Summary] Successfully generated.');
    return text;
  } catch (error) {
    console.error('Gemini Trend Summary Error:', error.message);
    throw new Error('Failed to generate trend summary with AI');
  }
};

module.exports = {
  analyzeFeedback,
  generateTrendSummary
};
