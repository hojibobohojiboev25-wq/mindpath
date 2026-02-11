// Questionnaire questions for personality analysis
const questionnaireQuestions = [
  {
    id: 'goals',
    question: 'Какие ваши основные жизненные цели?',
    type: 'text',
    category: 'motivation'
  },
  {
    id: 'strengths',
    question: 'Какие ваши сильные стороны и таланты?',
    type: 'text',
    category: 'strengths'
  },
  {
    id: 'challenges',
    question: 'С какими вызовами вы сталкиваетесь в жизни?',
    type: 'text',
    category: 'challenges'
  },
  {
    id: 'values',
    question: 'Какие ценности для вас наиболее важны?',
    type: 'multiselect',
    options: ['Честность', 'Семья', 'Карьера', 'Творчество', 'Здоровье', 'Духовность', 'Свобода', 'Власть', 'Деньги', 'Любовь'],
    category: 'values'
  },
  {
    id: 'personality',
    question: 'Как бы вы описали свой характер?',
    type: 'multiselect',
    options: ['Экстраверт', 'Интроверт', 'Оптимист', 'Пессимист', 'Лидер', 'Последователь', 'Творческий', 'Аналитический', 'Эмоциональный', 'Рациональный'],
    category: 'personality'
  },
  {
    id: 'work_style',
    question: 'Какой стиль работы вам больше подходит?',
    type: 'select',
    options: ['Командная работа', 'Индивидуальная работа', 'Свободный график', 'Строгий распорядок', 'Креативная среда', 'Структурированная среда'],
    category: 'work'
  },
  {
    id: 'learning_style',
    question: 'Как вы предпочитаете учиться?',
    type: 'select',
    options: ['Через практику', 'Через чтение', 'Через общение', 'Через визуализацию', 'Через эксперименты', 'Через структурированные курсы'],
    category: 'learning'
  },
  {
    id: 'decision_making',
    question: 'Как вы принимаете решения?',
    type: 'select',
    options: ['Интуитивно', 'Логически', 'Эмоционально', 'На основе опыта', 'Консультационно', 'Спонтанно'],
    category: 'decision_making'
  },
  {
    id: 'stress_handling',
    question: 'Как вы справляетесь со стрессом?',
    type: 'multiselect',
    options: ['Спорт', 'Медитация', 'Общение с друзьями', 'Работа', 'Хобби', 'Отдых', 'Анализ ситуации', 'Игнорирование'],
    category: 'stress'
  },
  {
    id: 'future_vision',
    question: 'Как вы видите себя через 5 лет?',
    type: 'text',
    category: 'vision'
  }
];

// Validate questionnaire responses
function validateResponses(responses) {
  const errors = [];

  questionnaireQuestions.forEach(question => {
    const response = responses[question.id];

    if (!response) {
      errors.push(`Ответ на вопрос "${question.question}" обязателен`);
      return;
    }

    if (question.type === 'multiselect' && !Array.isArray(response)) {
      errors.push(`Ответ на вопрос "${question.question}" должен быть массивом`);
    }

    if (question.type === 'select' && typeof response !== 'string') {
      errors.push(`Ответ на вопрос "${question.question}" должен быть строкой`);
    }

    if (question.type === 'text' && typeof response !== 'string') {
      errors.push(`Ответ на вопрос "${question.question}" должен быть текстом`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  questionnaireQuestions,
  validateResponses
};