const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
require('dotenv').config();

const listModels = async () => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    
    if (data.models) {
      const modelNames = data.models.map(m => m.name).join('\n');
      console.log('Writing models list to models_list.txt...');
      fs.writeFileSync('models_list.txt', modelNames);
      console.log('Done.');
    } else {
      console.log('No models found or error:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error listModels:', error);
  }
};

listModels();
