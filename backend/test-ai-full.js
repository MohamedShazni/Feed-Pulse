const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const testAI = async () => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log('SDK initialized.');
    
    console.log('Generating content with gemini-1.5-flash...');
    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: 'Say hello!' }] }]
    });
    
    console.log('Response:', result.text);
  } catch (error) {
    console.error('Error:', error);
    if (error.response) {
       console.log('Response body:', await error.response.json());
    }
  }
};

testAI();
