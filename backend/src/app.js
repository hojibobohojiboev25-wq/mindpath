const fastify = require('fastify');
const { registerSecurity } = require('./plugins/security');
const { healthRoutes } = require('./routes/health');
const { chatRoutes } = require('./routes/chat');
const { analysisRoutes } = require('./routes/analysis');
const { adminRoutes } = require('./routes/admin');

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
    scope.register(healthRoutes, { prefix: '/api' });
    scope.register(chatRoutes, { prefix: '/api' });
    scope.register(async (a) => analysisRoutes(a, config), { prefix: '/api' });
    scope.register(adminRoutes, { prefix: '/api' });
  });

  app.setErrorHandler((err, req, reply) => {
    req.log.error({ err }, 'request failed');
    reply.status(err.statusCode || 500).send({ error: err.message || 'Internal server error' });
  });

  return app;
}

module.exports = { buildApp };
