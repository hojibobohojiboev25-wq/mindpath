const { ok } = require('../lib/response');

async function healthRoutes(app) {
  app.get('/health', async (req, reply) =>
    ok(reply, { status: 'ok', timestamp: new Date().toISOString() })
  );
}

module.exports = { healthRoutes };
