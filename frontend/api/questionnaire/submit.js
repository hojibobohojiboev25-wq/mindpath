// Real AI personality analysis with OpenAI
async function analyzePersonalityWithAI(responses) {
  try {
    const prompt = createPersonalityAnalysisPrompt(responses);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
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
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    return parsePersonalityAnalysis(analysisText);
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to simple analysis
    return analyzePersonalitySimple(responses);
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
  // Simple parser - in production you might want more sophisticated parsing
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

// Fallback simple analysis
function analyzePersonalitySimple(responses) {
  let traits = [];
  let strengths = [];
  let development_areas = [];
  let career_recommendations = [];
  let self_development = [];

  // Analyze based on responses
  if (responses.personality && responses.personality.includes('Интроверт')) {
    traits.push('Интровертный тип личности');
    self_development.push('Развитие навыков общения в больших группах');
  }

  if (responses.personality && responses.personality.includes('Экстраверт')) {
    traits.push('Экстравертный тип личности');
    career_recommendations.push('Карьера в сфере продаж или преподавания');
  }

  if (responses.values && responses.values.includes('Творчество')) {
    strengths.push('Творческий подход к решению задач');
    career_recommendations.push('Творческие профессии (дизайн, искусство, маркетинг)');
  }

  if (responses.work_style === 'Командная работа') {
    traits.push('Командный игрок');
    career_recommendations.push('Работа в команде или проектная деятельность');
  }

  if (responses.learning_style === 'Через практику') {
    strengths.push('Практический подход к обучению');
    self_development.push('Больше практических проектов и hands-on опыта');
  }

  if (responses.stress_handling && responses.stress_handling.includes('Спорт')) {
    self_development.push('Регулярные занятия спортом для поддержания здоровья');
  }

  // Default responses if analysis is empty
  if (traits.length === 0) {
    traits = ['Универсальный тип личности', 'Адаптивный характер'];
  }
  if (strengths.length === 0) {
    strengths = ['Гибкость', 'Способность к обучению', 'Коммуникабельность'];
  }
  if (development_areas.length === 0) {
    development_areas = ['Развитие лидерских качеств', 'Углубление профессиональных навыков'];
  }
  if (career_recommendations.length === 0) {
    career_recommendations = ['Карьера в IT', 'Бизнес-развитие', 'Творческие профессии'];
  }
  if (self_development.length === 0) {
    self_development = ['Изучение новых технологий', 'Развитие soft skills', 'Здоровый образ жизни'];
  }

  return {
    traits: Array.isArray(traits) ? traits.join(', ') : traits,
    strengths: Array.isArray(strengths) ? strengths.join(', ') : strengths,
    development_areas: Array.isArray(development_areas) ? development_areas.join(', ') : development_areas,
    career_recommendations: Array.isArray(career_recommendations) ? career_recommendations.join(', ') : career_recommendations,
    self_development: Array.isArray(self_development) ? self_development.join(', ') : self_development
  };
}

// Generate mind map data
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

  // Add main categories
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

  // Add responses
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

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { responses } = req.body;

    // Validate responses
    if (!responses || typeof responses !== 'object') {
      return res.status(400).json({ error: 'Invalid responses' });
    }

    // Analyze personality with AI
    const personalityAnalysis = await analyzePersonalityWithAI(responses);

    // Generate mind map data
    const mindMapData = generateMindMapData(responses, personalityAnalysis);

    // Generate recommendations
    const recommendations = [
      {
        category: 'Личное развитие',
        title: 'Самоанализ',
        description: 'Регулярно анализируйте свои достижения и ставьте новые цели'
      },
      {
        category: 'Карьера',
        title: 'Профессиональный рост',
        description: 'Изучайте новые навыки и технологии в вашей области'
      },
      {
        category: 'Здоровье',
        title: 'Баланс жизни',
        description: 'Поддерживайте баланс между работой и отдыхом'
      }
    ];

    // Mock analysis result
    const result = {
      id: Date.now(),
      personalityAnalysis,
      mindMapData,
      recommendations,
      mindMapImageUrl: null, // No image generation in serverless
      createdAt: new Date().toISOString(),
      questionnaireDate: new Date().toISOString()
    };

    res.json({
      success: true,
      questionnaireId: Date.now(),
      message: 'Questionnaire submitted successfully. Analysis completed.'
    });

    // Generate mind map image (optional - can be slow in serverless)
    let mindMapImageUrl = null;
    try {
      if (process.env.STABILITY_API_KEY) {
        mindMapImageUrl = await generateMindMapImage(responses, personalityAnalysis);
      }
    } catch (imageError) {
      console.error('Image generation error:', imageError);
      // Continue without image
    }

    // Mock analysis result
    const result = {
      id: Date.now(),
      personalityAnalysis,
      mindMapData,
      recommendations,
      mindMapImageUrl,
      createdAt: new Date().toISOString(),
      questionnaireDate: new Date().toISOString()
    };

    res.json({
      success: true,
      questionnaireId: Date.now(),
      message: 'Questionnaire submitted successfully. Analysis completed.',
      result
    });

  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ error: 'Failed to submit questionnaire' });
  }
}

module.exports = handler;

// Generate mind map image using Stability AI
async function generateMindMapImage(responses, personalityAnalysis) {
  try {
    const prompt = createMindMapImagePrompt(responses, personalityAnalysis);

    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
        style_preset: 'enhance'
      })
    });

    if (!response.ok) {
      throw new Error(`Stability AI API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.artifacts && data.artifacts[0]) {
      // In a real implementation, you'd upload this to cloud storage
      // For now, we'll return a placeholder
      return `data:image/png;base64,${data.artifacts[0].base64}`;
    }

    return null;
  } catch (error) {
    console.error('Stability AI error:', error);
    return null;
  }
}

function createMindMapImagePrompt(responses, personalityAnalysis) {
  let prompt = 'Create a beautiful, colorful mind map visualization showing personality analysis. ';

  // Add key elements from responses
  if (responses.values && Array.isArray(responses.values)) {
    prompt += `Core values: ${responses.values.join(', ')}. `;
  }

  if (responses.personality && Array.isArray(responses.personality)) {
    prompt += `Personality traits: ${responses.personality.join(', ')}. `;
  }

  if (responses.strengths) {
    prompt += `Strengths: ${responses.strengths}. `;
  }

  if (responses.goals) {
    prompt += `Goals: ${responses.goals}. `;
  }

  // Add artistic style
  prompt += 'Style: clean, modern, infographic, mind map with central node connected to various branches, colorful, professional, inspirational, digital art, high quality, detailed.';

  return prompt;
}