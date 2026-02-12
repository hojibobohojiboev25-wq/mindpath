const bcrypt = require('bcryptjs');
const { prisma } = require('../db');

async function ensureAdminUser(username, password) {
  const existing = await prisma.adminUser.findUnique({ where: { username } });
  if (existing) return existing;
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.adminUser.create({
    data: { username, passwordHash }
  });
}

async function verifyAdmin(username, password) {
  const user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

module.exports = { ensureAdminUser, verifyAdmin };
