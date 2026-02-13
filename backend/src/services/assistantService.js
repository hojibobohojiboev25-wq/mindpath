const OpenAI = require('openai');
const { prisma } = require('../db');

function openAiClient(apiKey) {
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

async function ensureProfile(profileId, fallbackName = null) {
  const existing = await prisma.profile.findUnique({ where: { id: profileId } });
  if (existing) return existing;
  return prisma.profile.create({
    data: {
      id: profileId,
      name: fallbackName || `user_${String(profileId).slice(-6)}`,
      avatar: '👤'
    }
  });
}

async function createThread(profileId, title) {
  await ensureProfile(profileId);
  return prisma.aiAssistantThread.create({
    data: { profileId, title: title || 'New Thread' }
  });
}

async function listThreads(profileId) {
  return prisma.aiAssistantThread.findMany({
    where: { profileId },
    orderBy: { updatedAt: 'desc' },
    take: 30
  });
}

async function listMessages(threadId) {
  return prisma.aiAssistantMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: 'asc' },
    take: 200
  });
}

async function sendMessage({ profileId, threadId, content, openAiApiKey }) {
  await ensureProfile(profileId);

  const thread = await prisma.aiAssistantThread.findUnique({ where: { id: threadId } });
  if (!thread) {
    throw new Error('Thread not found');
  }

  await prisma.aiAssistantMessage.create({
    data: {
      threadId,
      profileId,
      role: 'USER',
      content
    }
  });

  const recent = await prisma.aiAssistantMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: 'desc' },
    take: 14
  });
  const context = recent.reverse().map((m) => ({
    role: m.role === 'ASSISTANT' ? 'assistant' : m.role === 'SYSTEM' ? 'system' : 'user',
    content: m.content
  }));

  let assistantText = 'Я сохранил ваш запрос. Добавьте OPENAI_API_KEY для полноценного ответа.';
  const client = openAiClient(openAiApiKey);
  if (client) {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.5,
      max_tokens: 600,
      messages: [
        {
          role: 'system',
          content: 'You are MindPath AI assistant. Answer clearly and practically.'
        },
        ...context
      ]
    });
    assistantText = completion.choices?.[0]?.message?.content || assistantText;
  }

  const assistantMessage = await prisma.aiAssistantMessage.create({
    data: {
      threadId,
      profileId,
      role: 'ASSISTANT',
      content: assistantText
    }
  });

  await prisma.aiAssistantThread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() }
  });

  return assistantMessage;
}

module.exports = {
  createThread,
  listThreads,
  listMessages,
  sendMessage
};
