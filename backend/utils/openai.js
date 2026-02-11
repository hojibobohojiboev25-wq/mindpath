const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Analyze personality based on questionnaire responses
async function analyzePersonality(responses) {
  try {
    const prompt = createPersonalityAnalysisPrompt(responses);

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional psychologist and career counselor. Analyze the personality based on the questionnaire responses and provide detailed insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const analysisText = response.data.choices[0].message.content;

    // Parse the analysis into structured data
    return parsePersonalityAnalysis(analysisText);

  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    throw new Error('Failed to analyze personality');
  }
}

// Create prompt for personality analysis
function createPersonalityAnalysisPrompt(responses) {
  let prompt = 'Проанализируйте личность человека на основе следующих ответов на вопросы:\n\n';

  // Format responses for the prompt
  Object.entries(responses).forEach(([key, value]) => {
    let questionText = '';
    let answerText = '';

    switch (key) {
      case 'goals':
        questionText = 'Жизненные цели';
        answerText = value;
        break;
      case 'strengths':
        questionText = 'Сильные стороны и таланты';
        answerText = value;
        break;
      case 'challenges':
        questionText = 'Основные вызовы';
        answerText = value;
        break;
      case 'values':
        questionText = 'Важные ценности';
        answerText = Array.isArray(value) ? value.join(', ') : value;
        break;
      case 'personality':
        questionText = 'Черты характера';
        answerText = Array.isArray(value) ? value.join(', ') : value;
        break;
      case 'work_style':
        questionText = 'Предпочитаемый стиль работы';
        answerText = value;
        break;
      case 'learning_style':
        questionText = 'Стиль обучения';
        answerText = value;
        break;
      case 'decision_making':
        questionText = 'Стиль принятия решений';
        answerText = value;
        break;
      case 'stress_handling':
        questionText = 'Способы coping со стрессом';
        answerText = Array.isArray(value) ? value.join(', ') : value;
        break;
      case 'future_vision':
        questionText = 'Видение себя через 5 лет';
        answerText = value;
        break;
    }

    prompt += `${questionText}: ${answerText}\n`;
  });

  prompt += '\nПожалуйста, предоставьте анализ личности в следующем формате:\n';
  prompt += '1. Основные черты характера\n';
  prompt += '2. Сильные стороны\n';
  prompt += '3. Области для развития\n';
  prompt += '4. Карьерные рекомендации\n';
  prompt += '5. Рекомендации по саморазвитию\n';

  return prompt;
}

// Parse the AI response into structured data
function parsePersonalityAnalysis(analysisText) {
  // This is a simple parser - in production you might want more sophisticated parsing
  const sections = analysisText.split(/\d+\./);

  return {
    traits: extractSection(sections, 1) || 'Не удалось определить основные черты',
    strengths: extractSection(sections, 2) || 'Не удалось определить сильные стороны',
    development_areas: extractSection(sections, 3) || 'Не удалось определить области для развития',
    career_recommendations: extractSection(sections, 4) || 'Не удалось определить карьерные рекомендации',
    self_development: extractSection(sections, 5) || 'Не удалось определить рекомендации по саморазвитию',
    raw_analysis: analysisText
  };
}

function extractSection(sections, index) {
  if (sections[index]) {
    return sections[index].trim();
  }
  return null;
}

module.exports = {
  analyzePersonality
};