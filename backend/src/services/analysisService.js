const { prisma } = require('../db');
const OpenAI = require('openai');

const analysisQueue = new Map();

function getOpenAiClient(apiKey) {
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

function fallbackAnalysis(responses) {
  const traits = Object.keys(responses).slice(0, 3).join(', ') || 'Сбалансированный профиль';
  return {
    traits,
    strengths: 'Адаптивность, обучаемость, коммуникация',
    development_areas: 'Регулярная рефлексия и фокус на приоритетах',
    career_recommendations: 'Роли с аналитикой и командным взаимодействием',
    self_development: 'Определяйте цели на 90 дней и измеряйте прогресс еженедельно'
  };
}

function buildMindMap(responses) {
  const nodes = [{ id: 'center', text: 'Личность', type: 'center' }];
  const edges = [];
  let idx = 1;
  Object.entries(responses).forEach(([key, value]) => {
    const categoryId = `cat_${idx++}`;
    nodes.push({ id: categoryId, text: key, type: 'category' });
    edges.push({ from: 'center', to: categoryId });
    if (Array.isArray(value)) {
      value.forEach((item) => {
        const itemId = `item_${idx++}`;
        nodes.push({ id: itemId, text: String(item), type: 'item' });
        edges.push({ from: categoryId, to: itemId });
      });
    } else if (value != null && value !== '') {
      const itemId = `item_${idx++}`;
      nodes.push({ id: itemId, text: String(value).slice(0, 80), type: 'item' });
      edges.push({ from: categoryId, to: itemId });
    }
  });
  return { nodes, edges };
}

async function submitQuestionnaire({ profile, responses }) {
  await prisma.profile.upsert({
    where: { id: profile.id },
    create: { id: profile.id, name: profile.name, avatar: profile.avatar || '👤' },
    update: { name: profile.name, avatar: profile.avatar || '👤' }
  });

  const submission = await prisma.questionnaireSubmission.create({
    data: {
      profileId: profile.id,
      responses,
      status: 'SUBMITTED'
    }
  });

  analysisQueue.set(submission.id, { status: 'SUBMITTED', progress: 5 });
  await prisma.auditLog.create({
    data: {
      actor: profile.id,
      action: 'questionnaire_submitted',
      metadata: { submissionId: submission.id }
    }
  });
  return submission;
}

async function processSubmission(submissionId, { openAiApiKey }) {
  const submission = await prisma.questionnaireSubmission.findUnique({
    where: { id: submissionId },
    include: { profile: true }
  });
  if (!submission) {
    throw new Error('Submission not found');
  }

  analysisQueue.set(submissionId, { status: 'PROCESSING', progress: 25 });
  await prisma.questionnaireSubmission.update({
    where: { id: submissionId },
    data: { status: 'PROCESSING' }
  });

  let personalityAnalysis = fallbackAnalysis(submission.responses);
  const client = getOpenAiClient(openAiApiKey);
  if (client) {
    try {
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a concise psychologist assistant.' },
          { role: 'user', content: `Analyze personality based on JSON responses: ${JSON.stringify(submission.responses)}` }
        ],
        temperature: 0.4
      });
      const text = completion.choices?.[0]?.message?.content || '';
      personalityAnalysis = {
        ...personalityAnalysis,
        traits: text.slice(0, 1000) || personalityAnalysis.traits
      };
    } catch (err) {
      // Fallback already prepared
    }
  }

  analysisQueue.set(submissionId, { status: 'PROCESSING', progress: 70 });
  const mindMapData = buildMindMap(submission.responses);
  const recommendations = [
    { category: 'Self Development', title: 'Weekly Reflection', description: 'Review wins and blockers every week.' },
    { category: 'Career', title: 'Skill Focus', description: 'Invest 3 sessions weekly in one priority skill.' }
  ];

  const result = await prisma.analysisResult.create({
    data: {
      profileId: submission.profileId,
      submissionId: submission.id,
      personalityAnalysis,
      recommendations,
      mindMapData,
      status: 'COMPLETED',
      progress: 100
    }
  });

  await prisma.mindMapRevision.create({
    data: {
      analysisResultId: result.id,
      data: mindMapData
    }
  });

  await prisma.questionnaireSubmission.update({
    where: { id: submissionId },
    data: { status: 'COMPLETED' }
  });

  analysisQueue.set(submissionId, { status: 'COMPLETED', progress: 100, resultId: result.id });
  await prisma.auditLog.create({
    data: {
      actor: submission.profileId,
      action: 'analysis_completed',
      metadata: { submissionId, resultId: result.id }
    }
  });
  return result;
}

function getSubmissionStatus(submissionId) {
  return analysisQueue.get(submissionId) || { status: 'SUBMITTED', progress: 0 };
}

async function getLatestResult(profileId) {
  return prisma.analysisResult.findFirst({
    where: { profileId },
    orderBy: { createdAt: 'desc' }
  });
}

async function updateMindMap(analysisResultId, data) {
  const updated = await prisma.analysisResult.update({
    where: { id: analysisResultId },
    data: { mindMapData: data }
  });
  await prisma.mindMapRevision.create({
    data: { analysisResultId, data }
  });
  return updated;
}

module.exports = {
  submitQuestionnaire,
  processSubmission,
  getSubmissionStatus,
  getLatestResult,
  updateMindMap
};
