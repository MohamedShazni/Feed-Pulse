const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const listModels = async () => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log('Listing models...');
    const result = await ai.models.list();
    console.log('Models:', result.map(m => m.name));
  } catch (error) {
    console.error('Error:', error);
  }
};

listModels();
