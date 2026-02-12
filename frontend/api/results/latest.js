// Mock result data (in production, this would come from a database)
const mockResult = {
  id: 1,
  personalityAnalysis: {
    traits: 'Адаптивный, творческий, аналитический тип личности',
    strengths: 'Гибкость, способность к обучению, творческий подход',
    development_areas: 'Развитие лидерских качеств, углубление технических навыков',
    career_recommendations: 'Карьера в IT, дизайн, маркетинг, проектная деятельность',
    self_development: 'Изучение новых технологий, развитие soft skills, здоровый образ жизни'
  },
  mindMapData: {
    nodes: [
      { id: 'center', text: 'Моя личность', x: 400, y: 300, type: 'center' },
      { id: 'cat_1', text: 'Ценности', x: 550, y: 300, type: 'category' },
      { id: 'cat_2', text: 'Характер', x: 400, y: 150, type: 'category' },
      { id: 'cat_3', text: 'Работа', x: 250, y: 300, type: 'category' },
      { id: 'item_4', text: 'Творчество', x: 600, y: 250, type: 'item' },
      { id: 'item_5', text: 'Аналитический', x: 400, y: 100, type: 'item' },
      { id: 'item_6', text: 'Командная работа', x: 200, y: 350, type: 'item' }
    ],
    edges: [
      { from: 'center', to: 'cat_1', type: 'category' },
      { from: 'center', to: 'cat_2', type: 'category' },
      { from: 'center', to: 'cat_3', type: 'category' },
      { from: 'cat_1', to: 'item_4', type: 'item' },
      { from: 'cat_2', to: 'item_5', type: 'item' },
      { from: 'cat_3', to: 'item_6', type: 'item' }
    ]
  },
  recommendations: [
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
  ],
  mindMapImageUrl: null,
  createdAt: new Date().toISOString(),
  questionnaireDate: new Date().toISOString()
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Return mock result (in production, fetch from database)
    res.json({
      result: {
        id: mockResult.id,
        personalityAnalysis: mockResult.personalityAnalysis,
        mindMapData: mockResult.mindMapData,
        recommendations: mockResult.recommendations,
        mindMapImageUrl: mockResult.mindMapImageUrl,
        createdAt: mockResult.createdAt,
        questionnaireDate: mockResult.questionnaireDate
      }
    });

  } catch (error) {
    console.error('Get latest result error:', error);
    res.status(500).json({ error: 'Failed to get analysis results' });
  }
}