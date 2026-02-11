const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { questionnaireQuestions, validateResponses } = require('../utils/questionnaire');
const AnalysisResult = require('../models/AnalysisResult');

const router = express.Router();

// GET /api/questionnaire/questions - Get questionnaire questions
router.get('/questions', requireAuth, (req, res) => {
  res.json({
    questions: questionnaireQuestions
  });
});

// POST /api/questionnaire/submit - Submit questionnaire responses
router.post('/submit', requireAuth, async (req, res) => {
  try {
    const { responses } = req.body;

    // Validate responses
    const validation = validateResponses(responses);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Invalid responses',
        details: validation.errors
      });
    }

    // Save questionnaire responses
    const questionnaireId = await AnalysisResult.saveQuestionnaireResponse(
      req.session.userId,
      responses
    );

    // Start analysis process (this will be handled by a background job in production)
    // For now, we'll trigger it immediately
    const analysisPromise = performAnalysis(req.session.userId, questionnaireId, responses);

    res.json({
      success: true,
      questionnaireId,
      message: 'Questionnaire submitted successfully. Analysis in progress.'
    });

    // Perform analysis asynchronously
    analysisPromise.catch(error => {
      console.error('Analysis error:', error);
    });

  } catch (error) {
    console.error('Submit questionnaire error:', error);
    res.status(500).json({ error: 'Failed to submit questionnaire' });
  }
});

// Helper function to perform analysis
async function performAnalysis(userId, questionnaireId, responses) {
  try {
    // Import AI services
    const { analyzePersonality } = require('../utils/openai');
    const { generateMindMap } = require('../utils/stability');

    // Analyze personality with OpenAI
    const personalityAnalysis = await analyzePersonality(responses);

    // Generate mind map data for visualization
    const mindMapData = generateMindMapData(responses, personalityAnalysis);

    // Generate visual mind map with Stability AI
    const mindMapImageUrl = await generateMindMap(responses, personalityAnalysis);

    // Generate recommendations
    const recommendations = generateRecommendations(personalityAnalysis, responses);

    // Save analysis result
    await AnalysisResult.saveAnalysisResult(userId, questionnaireId, {
      personality_analysis: personalityAnalysis,
      mind_map_data: mindMapData,
      recommendations,
      mind_map_image_url: mindMapImageUrl
    });

    console.log(`Analysis completed for user ${userId}`);

  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
}

// Generate mind map data structure for visualization
function generateMindMapData(responses, personalityAnalysis) {
  const centerNode = {
    id: 'center',
    text: 'Моя личность',
    x: 400,
    y: 300,
    type: 'center'
  };

  const nodes = [centerNode];
  const edges = [];

  // Add main categories as child nodes
  const categories = {
    values: 'Ценности',
    personality: 'Характер',
    work: 'Работа',
    learning: 'Обучение',
    decision_making: 'Принятие решений',
    stress: 'Стресс',
    motivation: 'Мотивация',
    strengths: 'Сильные стороны',
    challenges: 'Вызовы',
    vision: 'Видение будущего'
  };

  let nodeId = 1;
  const categoryNodes = [];

  Object.entries(categories).forEach(([key, label], index) => {
    const angle = (index / Object.keys(categories).length) * 2 * Math.PI;
    const radius = 150;
    const x = 400 + Math.cos(angle) * radius;
    const y = 300 + Math.sin(angle) * radius;

    const categoryNode = {
      id: `cat_${nodeId}`,
      text: label,
      x,
      y,
      type: 'category',
      category: key
    };

    nodes.push(categoryNode);
    edges.push({
      from: 'center',
      to: `cat_${nodeId}`,
      type: 'category'
    });

    categoryNodes.push({ key, node: categoryNode });
    nodeId++;
  });

  // Add specific responses as leaf nodes
  categoryNodes.forEach(({ key, node }) => {
    const response = responses[key];
    if (response) {
      if (Array.isArray(response)) {
        response.forEach((item, index) => {
          const angle = Math.random() * 2 * Math.PI;
          const radius = 80;
          const x = node.x + Math.cos(angle) * radius;
          const y = node.y + Math.sin(angle) * radius;

          nodes.push({
            id: `item_${nodeId}`,
            text: item,
            x,
            y,
            type: 'item',
            category: key
          });

          edges.push({
            from: node.id,
            to: `item_${nodeId}`,
            type: 'item'
          });

          nodeId++;
        });
      } else if (typeof response === 'string' && response.length > 0) {
        const angle = Math.random() * 2 * Math.PI;
        const radius = 80;
        const x = node.x + Math.cos(angle) * radius;
        const y = node.y + Math.sin(angle) * radius;

        nodes.push({
          id: `item_${nodeId}`,
          text: response.length > 50 ? response.substring(0, 50) + '...' : response,
          x,
          y,
          type: 'item',
          category: key
        });

        edges.push({
          from: node.id,
          to: `item_${nodeId}`,
          type: 'item'
        });

        nodeId++;
      }
    }
  });

  return { nodes, edges };
}

// Generate recommendations based on analysis
function generateRecommendations(personalityAnalysis, responses) {
  const recommendations = [];

  // Basic recommendations based on responses
  if (responses.personality && responses.personality.includes('Интроверт')) {
    recommendations.push({
      category: 'Личное развитие',
      title: 'Развитие социальных навыков',
      description: 'Попробуйте постепенно расширять свой круг общения через хобби или онлайн-сообщества'
    });
  }

  if (responses.work_style === 'Командная работа') {
    recommendations.push({
      category: 'Карьера',
      title: 'Командные проекты',
      description: 'Ищите возможности для работы в команде, где вы сможете развивать навыки сотрудничества'
    });
  }

  if (responses.learning_style === 'Через практику') {
    recommendations.push({
      category: 'Обучение',
      title: 'Практический подход',
      description: 'Выбирайте курсы и материалы, которые включают практические задания и проекты'
    });
  }

  if (responses.stress_handling && responses.stress_handling.includes('Спорт')) {
    recommendations.push({
      category: 'Здоровье',
      title: 'Регулярные тренировки',
      description: 'Поддерживайте регулярный режим тренировок для поддержания физического и психического здоровья'
    });
  }

  return recommendations;
}

module.exports = router;