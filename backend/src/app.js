const fastify = require('fastify');
const { registerSecurity } = require('./plugins/security');
const { healthRoutes } = require('./routes/health');
const { chatRoutes } = require('./routes/chat');
const { analysisRoutes } = require('./routes/analysis');
const { adminRoutes } = require('./routes/admin');
const { assistantRoutes } = require('./routes/assistant');
const { fail } = require('./lib/response');

async function buildApp(config) {
  const app = fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'development'
        ? { target: 'pino-pretty' }
        : undefined
    }
  });

  app.decorate('config', config);
  await registerSecurity(app, config);
  const allowedOrigins = config.corsOrigin.split(',').map((v) => v.trim());

  app.addHook('preHandler', async (req, reply) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return;
    const origin = req.headers.origin;
    if (origin && !allowedOrigins.includes(origin)) {
      return reply.status(403).send({ error: 'Forbidden origin' });
    }
  });

  app.register(async (scope) => {
    scope.register(healthRoutes, { prefix: '/api/v1' });
    scope.register(chatRoutes, { prefix: '/api/v1' });
    scope.register(async (a) => analysisRoutes(a, config), { prefix: '/api/v1' });
    scope.register(adminRoutes, { prefix: '/api/v1' });
    scope.register(async (a) => assistantRoutes(a, config), { prefix: '/api/v1' });
  });

  app.setErrorHandler((err, req, reply) => {
    req.log.error({ err }, 'request failed');
    return fail(reply, err.statusCode || 500, 'INTERNAL_ERROR', err.message || 'Internal server error');
  });

  return app;
}

module.exports = { buildApp };
