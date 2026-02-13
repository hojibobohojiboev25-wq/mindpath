const { submitQuestionnaireSchema, updateMindMapSchema } = require('../validators/analysis');
const { ok, fail } = require('../lib/response');
const {
  submitQuestionnaire,
  processSubmission,
  getSubmissionStatus,
  getLatestResult,
  updateMindMap
} = require('../services/analysisService');

async function analysisRoutes(app, config) {
  app.get('/questionnaire/questions', async (req, reply) => {
    const questions = [
      { id: 'goals', question: 'Какие ваши основные жизненные цели?', type: 'text', category: 'motivation' },
      { id: 'strengths', question: 'Какие ваши сильные стороны и таланты?', type: 'text', category: 'strengths' },
      { id: 'challenges', question: 'С какими вызовами вы сталкиваетесь в жизни?', type: 'text', category: 'challenges' },
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
      { id: 'future_vision', question: 'Как вы видите себя через 5 лет?', type: 'text', category: 'vision' }
    ];
    return ok(reply, { questions });
  });

  app.post('/questionnaire/submit', async (req, reply) => {
    const parsed = submitQuestionnaireSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return fail(reply, 400, 'BAD_REQUEST', 'Invalid questionnaire payload');
    }
    const submission = await submitQuestionnaire(parsed.data);
    processSubmission(submission.id, { openAiApiKey: config.openAiApiKey }).catch((err) => {
      app.log.error({ err, submissionId: submission.id }, 'AI submission processing failed');
    });
    return ok(reply, { submissionId: submission.id, status: 'SUBMITTED' });
  });

  app.get('/questionnaire/status/:submissionId', async (req, reply) => {
    const status = getSubmissionStatus(req.params.submissionId);
    return ok(reply, status);
  });

  app.get('/results/latest', async (req, reply) => {
    const profileId = req.query.profileId;
    if (!profileId) {
      return fail(reply, 400, 'BAD_REQUEST', 'profileId is required');
    }
    const result = await getLatestResult(profileId);
    if (!result) {
      return fail(reply, 404, 'NOT_FOUND', 'No results found');
    }
    return ok(reply, { result });
  });

  app.patch('/mind-map/:analysisResultId', async (req, reply) => {
    const parsed = updateMindMapSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return fail(reply, 400, 'BAD_REQUEST', 'Invalid mind map payload');
    }
    const updated = await updateMindMap(req.params.analysisResultId, parsed.data.data);
    return ok(reply, { result: updated });
  });
}

module.exports = { analysisRoutes };
