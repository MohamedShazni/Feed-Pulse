const { analyzeFeedback } = require('../services/gemini.service');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Mock the AI SDK
jest.mock('@google/generative-ai');

describe('Gemini Service', () => {
  let mockGenAI;
  let mockModel;

  beforeEach(() => {
    jest.clearAllMocks();
    
    process.env.GEMINI_API_KEY = 'test_key_12345';

    mockModel = {
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            category: 'Bug',
            sentiment: 'Negative',
            priority_score: 9,
            summary: 'Mocked gemini summary',
            tags: ['crash', 'urgent']
          })
        }
      })
    };

    mockGenAI = {
      getGenerativeModel: jest.fn().mockReturnValue(mockModel)
    };

    GoogleGenerativeAI.mockImplementation(() => mockGenAI);
  });

  test('analyzeFeedback - mocks API call and tests parsing logic', async () => {
    const result = await analyzeFeedback('System crashes on login', 'Users are reporting that the app closes immediately.');

    expect(result.category).toBe('Bug');
    expect(result.priority_score).toBe(9);
    expect(mockModel.generateContent).toHaveBeenCalledTimes(1);
  });
});
