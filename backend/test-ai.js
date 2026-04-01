const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

console.log('API Key:', process.env.GEMINI_API_KEY ? 'Defined' : 'Undefined');

try {
  console.log('Initializing GoogleGenAI...');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  console.log('Success!');
} catch (error) {
  console.error('Failed to initialize:', error);
}
