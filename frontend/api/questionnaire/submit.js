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
  let prompt = `Ты - профессиональный психолог и эксперт по психологии личности. Проанализируй личность человека на основе его ответов на психологический тест. Будь максимально точен, глубок и полезен в своем анализе.

ИНСТРУКЦИИ ДЛЯ АНАЛИЗА:
- Используй современные психологические концепции (Большая пятерка, Майерс-Бриггс, когнитивные стили)
- Будь объективен и основывайся только на предоставленных данных
- Структура анализа должна быть академической и профессиональной
- Избегай клише и общих фраз
- Дай конкретные, практические рекомендации

ОТВЕТЫ ЧЕЛОВЕКА:\n\n`;

  // Format responses with proper psychological context
  Object.entries(responses).forEach(([key, value]) => {
    let questionText = '';
    let psychologicalDomain = '';
    let answerText = Array.isArray(value) ? value.join(', ') : value;

    switch (key) {
      case 'goals':
        questionText = 'Жизненные цели';
        psychologicalDomain = '(Показывает ценности, мотивацию и временную перспективу)';
        break;
      case 'strengths':
        questionText = 'Сильные стороны и таланты';
        psychologicalDomain = '(Раскрывает ключевые преимущества и потенциал)';
        break;
      case 'challenges':
        questionText = 'Основные вызовы';
        psychologicalDomain = '(Указывает на зоны роста и препятствия)';
        break;
      case 'values':
        questionText = 'Важные ценности';
        psychologicalDomain = '(Определяет систему приоритетов и мировоззрение)';
        break;
      case 'personality':
        questionText = 'Черты характера';
        psychologicalDomain = '(Характеризует базовые паттерны поведения)';
        break;
      case 'work_style':
        questionText = 'Предпочитаемый стиль работы';
        psychologicalDomain = '(Показывает мотивацию и рабочие предпочтения)';
        break;
      case 'learning_style':
        questionText = 'Стиль обучения';
        psychologicalDomain = '(Раскрывает когнитивные предпочтения)';
        break;
      case 'decision_making':
        questionText = 'Стиль принятия решений';
        psychologicalDomain = '(Характеризует рациональность и интуицию)';
        break;
      case 'stress_handling':
        questionText = 'Способы coping со стрессом';
        psychologicalDomain = '(Указывает на механизмы адаптации и resilience)';
        break;
      case 'future_vision':
        questionText = 'Видение себя через 5 лет';
        psychologicalDomain = '(Показывает амбиции и целеполагание)';
        break;
    }

    prompt += `ВОПРОС: ${questionText}\n`;
    if (psychologicalDomain) prompt += `${psychologicalDomain}\n`;
    prompt += `ОТВЕТ: ${answerText}\n\n`;
  });

  prompt += `СТРУКТУРА АНАЛИЗА (обязательно следуй этой структуре):

🔍 ПСИХОЛОГИЧЕСКИЙ ПРОФИЛЬ:
- Доминирующие черты личности (по Большой пятерке)
- Когнитивный стиль мышления
- Эмоциональный темперамент
- Социальный стиль взаимодействия

💪 СИЛЬНЫЕ СТОРОНЫ:
- Ключевые преимущества и таланты
- Адаптивные стратегии поведения
- Ресурсы для преодоления трудностей

🎯 ОБЛАСТИ РАЗВИТИЯ:
- Потенциальные "слепые зоны"
- Ограничения текущих стратегий
- Рекомендации по самосовершенствованию

🚀 КАРЬЕРНЫЕ РЕКОМЕНДАЦИИ:
- Подходящие профессиональные сферы
- Идеальные роли и позиции
- Рабочая среда для максимальной эффективности

💡 ПРАКТИЧЕСКИЕ СОВЕТЫ:
- Конкретные действия по развитию
- Стратегии улучшения качества жизни
- Методы достижения личных целей

⚡ КОРОТКИЕ ИНСАЙТЫ:
- 3 главных открытия о себе
- Ключевые принципы для применения в жизни

Анализ должен быть глубоким, научно-обоснованным и практически полезным. Избегай общих фраз. Будь максимально конкретен и полезен.`;

  return prompt;
}

// Parse the AI response into structured data
function parsePersonalityAnalysis(analysisText) {
  // Extract sections based on emoji markers
  const sections = {
    traits: extractSectionByEmoji(analysisText, '🔍'),
    strengths: extractSectionByEmoji(analysisText, '💪'),
    development_areas: extractSectionByEmoji(analysisText, '🎯'),
    career_recommendations: extractSectionByEmoji(analysisText, '🚀'),
    self_development: extractSectionByEmoji(analysisText, '💡'),
    insights: extractSectionByEmoji(analysisText, '⚡')
  };

  // Fallback parsing if emoji extraction fails
  if (!sections.traits || sections.traits.length < 50) {
    const fallbackSections = analysisText.split(/\d+\.|•|-/);
    sections.traits = extractSection(fallbackSections, 1) || sections.traits || 'Не удалось определить психологический профиль';
    sections.strengths = extractSection(fallbackSections, 2) || sections.strengths || 'Не удалось определить сильные стороны';
    sections.development_areas = extractSection(fallbackSections, 3) || sections.development_areas || 'Не удалось определить области развития';
    sections.career_recommendations = extractSection(fallbackSections, 4) || sections.career_recommendations || 'Не удалось определить карьерные рекомендации';
    sections.self_development = extractSection(fallbackSections, 5) || sections.self_development || 'Не удалось определить практические советы';
  }

  return {
    traits: sections.traits,
    strengths: sections.strengths,
    development_areas: sections.development_areas,
    career_recommendations: sections.career_recommendations,
    self_development: sections.self_development + (sections.insights ? '\n\n' + sections.insights : ''),
    raw_analysis: analysisText
  };
}

function extractSection(sections, index) {
  if (sections[index]) {
    return sections[index].trim();
  }
  return null;
}

function extractSectionByEmoji(text, emoji) {
  const emojiIndex = text.indexOf(emoji);
  if (emojiIndex === -1) return null;

  // Find the next emoji marker after current section
  const nextPart = text.slice(emojiIndex + emoji.length);
  const markerRegex = /[🔍💪🎯🚀💡⚡]/g;
  const nextEmojiMatch = markerRegex.exec(nextPart);
  const endIndex = nextEmojiMatch
    ? emojiIndex + emoji.length + nextEmojiMatch.index
    : text.length;

  const section = text.slice(emojiIndex + emoji.length, endIndex).trim();

  // Clean up the section
  return section
    .replace(/^[:\s]+/, '') // Remove leading colons and spaces
    .replace(/\n+/g, '\n') // Normalize line breaks
    .trim();
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

    // Generate mind map image
    let mindMapImageUrl = null;
    try {
      if (process.env.STABILITY_API_KEY) {
        mindMapImageUrl = await generateMindMapImage(responses, personalityAnalysis);
      }
    } catch (imageError) {
      console.error('Image generation error:', imageError);
      // Continue without image
    }

    const aiStatus = {
      openai: Boolean(process.env.OPENAI_API_KEY),
      stability: Boolean(process.env.STABILITY_API_KEY),
      mindMapImageGenerated: Boolean(mindMapImageUrl)
    };

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
      aiStatus,
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