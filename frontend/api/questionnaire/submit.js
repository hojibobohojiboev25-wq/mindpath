// Simple personality analysis function
function analyzePersonality(responses) {
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
    traits: traits.join(', '),
    strengths: strengths.join(', '),
    development_areas: development_areas.join(', '),
    career_recommendations: career_recommendations.join(', '),
    self_development: self_development.join(', ')
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { responses } = req.body;

    // Validate responses
    if (!responses || typeof responses !== 'object') {
      return res.status(400).json({ error: 'Invalid responses' });
    }

    // Analyze personality
    const personalityAnalysis = analyzePersonality(responses);

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

  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ error: 'Failed to submit questionnaire' });
  }
}