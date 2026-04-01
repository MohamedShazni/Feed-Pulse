const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const listModels = async () => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log('Fetching models list...');
    const result = await ai.models.list();
    console.log('Full Model List:');
    result.forEach(m => {
      console.log(`- ${m.name} (Methods: ${m.supported_methods.join(', ')})`);
    });
  } catch (error) {
    console.error('Error listing models:', error);
  }
};

listModels();
