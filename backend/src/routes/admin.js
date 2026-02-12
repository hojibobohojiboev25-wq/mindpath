const { z } = require('zod');
const { verifyAdmin } = require('../services/authService');
const { prisma } = require('../db');

async function adminRoutes(app) {
  app.post('/admin/login', async (req, reply) => {
    const parsed = z.object({
      username: z.string().min(1),
      password: z.string().min(1)
    }).safeParse(req.body || {});
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid credentials payload' });
    }
    const user = await verifyAdmin(parsed.data.username.trim(), parsed.data.password.trim());
    if (!user) return reply.status(401).send({ error: 'Invalid username or password' });

    const token = await reply.jwtSign(
      { sub: user.id, username: user.username, role: 'admin' },
      { expiresIn: '4h' }
    );
    await prisma.auditLog.create({
      data: { actor: user.username, action: 'admin_login_success' }
    });
    return reply.send({ token });
  });

  app.post('/admin/verify', async (req, reply) => {
    const parsed = z.object({ token: z.string().min(1) }).safeParse(req.body || {});
    if (!parsed.success) return reply.status(400).send({ valid: false });

    try {
      const decoded = await app.jwt.verify(parsed.data.token);
      return reply.send({ valid: true, user: decoded });
    } catch {
      return reply.status(401).send({ valid: false });
    }
  });

  app.get('/admin/users', async (req, reply) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    try {
      await app.jwt.verify(auth.slice(7));
    } catch {
      return reply.status(401).send({ error: 'Invalid token' });
    }

    const users = await prisma.profile.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { chatMessages: true, analysisResults: true } }
      },
      take: 200
    });
    const rows = users.map((u) => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar || '👤',
      lastSeen: (u.lastSeenAt || u.updatedAt).toISOString(),
      status: u.lastSeenAt && Date.now() - new Date(u.lastSeenAt).getTime() < 5 * 60 * 1000 ? 'online' : 'offline',
      messagesCount: u._count.chatMessages,
      analysesCount: u._count.analysisResults
    }));
    return reply.send({
      users: rows,
      stats: {
        totalUsers: rows.length,
        activeUsers: rows.filter((u) => u.status === 'online').length,
        totalMessages: rows.reduce((acc, u) => acc + u.messagesCount, 0),
        totalAnalyses: rows.reduce((acc, u) => acc + u.analysesCount, 0)
      }
    });
  });
}

module.exports = { adminRoutes };
