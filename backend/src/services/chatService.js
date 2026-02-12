const { prisma } = require('../db');

async function upsertProfile(profile) {
  return prisma.profile.upsert({
    where: { id: profile.id },
    create: {
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar || '👤',
      lastSeenAt: new Date()
    },
    update: {
      name: profile.name,
      avatar: profile.avatar || '👤',
      lastSeenAt: new Date()
    }
  });
}

async function createMessage(payload) {
  return prisma.chatMessage.create({
    data: {
      profileId: payload.profileId,
      content: payload.content
    },
    include: {
      profile: true
    }
  });
}

async function getHistory(limit = 100) {
  const rows = await prisma.chatMessage.findMany({
    orderBy: { createdAt: 'asc' },
    take: Math.min(limit, 200),
    include: { profile: true, receipts: true }
  });
  return rows.map((m) => ({
    id: m.id,
    profileId: m.profileId,
    userName: m.profile.name,
    userAvatar: m.profile.avatar || '👤',
    content: m.content,
    status: m.status,
    timestamp: m.createdAt.toISOString()
  }));
}

async function markDelivered(messageId, profileId) {
  await prisma.chatReceipt.upsert({
    where: { messageId_profileId: { messageId, profileId } },
    create: { messageId, profileId, deliveredAt: new Date() },
    update: { deliveredAt: new Date() }
  });
  return prisma.chatMessage.update({
    where: { id: messageId },
    data: { status: 'DELIVERED' }
  });
}

async function markRead(messageId, profileId) {
  await prisma.chatReceipt.upsert({
    where: { messageId_profileId: { messageId, profileId } },
    create: { messageId, profileId, readAt: new Date() },
    update: { readAt: new Date() }
  });
  return prisma.chatMessage.update({
    where: { id: messageId },
    data: { status: 'READ' }
  });
}

module.exports = {
  upsertProfile,
  createMessage,
  getHistory,
  markDelivered,
  markRead
};
