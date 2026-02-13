const { z } = require('zod');
const { verifyAdmin } = require('../services/authService');
const { prisma } = require('../db');
const { ok, fail } = require('../lib/response');

async function adminRoutes(app) {
  app.post('/admin/login', async (req, reply) => {
    const parsed = z.object({
      username: z.string().min(1),
      password: z.string().min(1)
    }).safeParse(req.body || {});
    if (!parsed.success) {
      return fail(reply, 400, 'BAD_REQUEST', 'Invalid credentials payload');
    }
    const user = await verifyAdmin(parsed.data.username.trim(), parsed.data.password.trim());
    if (!user) return fail(reply, 401, 'UNAUTHORIZED', 'Invalid username or password');

    const token = await reply.jwtSign(
      { sub: user.id, username: user.username, role: 'admin' },
      { expiresIn: '4h' }
    );
    await prisma.auditLog.create({
      data: { actor: user.username, action: 'admin_login_success' }
    });
    return ok(reply, { token });
  });

  app.post('/admin/verify', async (req, reply) => {
    const parsed = z.object({ token: z.string().min(1) }).safeParse(req.body || {});
    if (!parsed.success) return fail(reply, 400, 'BAD_REQUEST', 'Invalid token payload');

    try {
      const decoded = await app.jwt.verify(parsed.data.token);
      return ok(reply, { valid: true, user: decoded });
    } catch {
      return fail(reply, 401, 'UNAUTHORIZED', 'Token is invalid');
    }
  });

  app.get('/admin/users', async (req, reply) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      return fail(reply, 401, 'UNAUTHORIZED', 'Unauthorized');
    }
    try {
      await app.jwt.verify(auth.slice(7));
    } catch {
      return fail(reply, 401, 'UNAUTHORIZED', 'Invalid token');
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
    return ok(reply, {
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
