require('dotenv').config();
const { buildApp } = require('./app');
const { getConfig } = require('./config');
const { prisma } = require('./db');
const { ensureAdminUser } = require('./services/authService');
const { registerWebsocket } = require('./websocket');

async function start() {
  const config = getConfig();
  const app = await buildApp(config);

  await ensureAdminUser(config.adminUsername, config.adminPassword);

  const io = registerWebsocket(app.server, app);
  app.decorate('io', io);

  await app.listen({ port: config.port, host: config.host });
  app.log.info(`API listening on http://${config.host}:${config.port}`);
}

start().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
