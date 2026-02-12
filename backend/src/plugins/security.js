async function registerSecurity(app, config) {
  await app.register(require('@fastify/helmet'), {
    contentSecurityPolicy: false
  });

  await app.register(require('@fastify/cors'), {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const allowed = config.corsOrigin.split(',').map((v) => v.trim());
      cb(null, allowed.includes(origin));
    },
    credentials: true
  });

  await app.register(require('@fastify/rate-limit'), {
    max: 120,
    timeWindow: '1 minute'
  });

  await app.register(require('@fastify/jwt'), {
    secret: config.jwtSecret
  });
}

module.exports = { registerSecurity };
